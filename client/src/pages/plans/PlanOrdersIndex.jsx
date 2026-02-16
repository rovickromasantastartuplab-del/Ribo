import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { planOrdersConfig } from '@/config/crud/plan-orders';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Mock Data
const mockPlanOrders = [
    {
        id: 1,
        order_number: 'ORD-2024-001',
        ordered_at: '2024-03-15T10:00:00Z',
        user: { name: 'John Doe' },
        plan: { name: 'Enterprise Plan' },
        original_price: 299,
        final_price: 299,
        coupon_code: null,
        discount_amount: 0,
        status: 'pending'
    },
    {
        id: 2,
        order_number: 'ORD-2024-002',
        ordered_at: '2024-03-14T14:20:00Z',
        user: { name: 'Alice Walker' },
        plan: { name: 'Pro Plan' },
        original_price: 99,
        final_price: 89,
        coupon_code: 'WELCOME10',
        discount_amount: 10,
        status: 'approved'
    },
    {
        id: 3,
        order_number: 'ORD-2024-003',
        ordered_at: '2024-03-10T09:00:00Z',
        user: { name: 'Bob Builder' },
        plan: { name: 'Startup Plan' },
        original_price: 49,
        final_price: 49,
        coupon_code: null,
        discount_amount: 0,
        status: 'rejected'
    }
];

export default function PlanOrdersIndex() {
    const { t } = useTranslation();
    const [data, setData] = useState(mockPlanOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState({ status: 'all' });
    const [showFilters, setShowFilters] = useState(false);

    // Reject Dialog State
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectionNotes, setRejectionNotes] = useState('');

    const handleAction = (action, item) => {
        if (action === 'approve') {
            toast.success(t('Order approved successfully'));
            setData(data.map(d => d.id === item.id ? { ...d, status: 'approved' } : d));
        } else if (action === 'reject') {
            setSelectedOrder(item);
            setRejectionNotes('');
            setShowRejectDialog(true);
        }
    };

    const confirmReject = () => {
        if (selectedOrder) {
            toast.success(t('Order rejected'));
            setData(data.map(d => d.id === selectedOrder.id ? { ...d, status: 'rejected' } : d));
            setShowRejectDialog(false);
            setSelectedOrder(null);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleFilterChange = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterValues.status === 'all' || item.status === filterValues.status;

        return matchesSearch && matchesStatus;
    });

    const activeFilterCount = () => {
        return (filterValues.status !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Plans'), href: '/plans' },
        { title: t('Plan Orders') }
    ];

    return (
        <PageTemplate
            title={t('Plan Orders')}
            description={t('Manage plan orders and subscription requests')}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={planOrdersConfig.filters.map(filter => ({
                        name: filter.key,
                        label: t(filter.label),
                        type: 'select',
                        value: filterValues[filter.key] || filter.options[0].value,
                        onChange: (value) => handleFilterChange(filter.key, value),
                        options: filter.options.map(option => ({
                            value: option.value,
                            label: t(option.label)
                        }))
                    }))}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => activeFilterCount() > 0}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={() => {
                        setSearchTerm('');
                        setFilterValues({ status: 'all' });
                    }}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={planOrdersConfig.table.columns.map(col => ({
                        ...col,
                        label: t(col.label),
                        render: col.render // Preserve render function from config
                    }))}
                    actions={planOrdersConfig.table.actions.map(action => ({
                        ...action,
                        label: t(action.label)
                    }))}
                    data={filteredData}
                    onAction={handleAction}
                    permissions={['approve-plan-orders', 'reject-plan-orders']}
                />
                <Pagination
                    from={1}
                    to={filteredData.length}
                    total={filteredData.length}
                    links={[]}
                    entityName={t("plan orders")}
                    onPageChange={() => { }}
                />
            </div>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Reject Plan Order')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="notes">{t('Rejection Reason')}</Label>
                            <Textarea
                                id="notes"
                                value={rejectionNotes}
                                onChange={(e) => setRejectionNotes(e.target.value)}
                                placeholder={t('Enter reason for rejection...')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmReject}>
                            {t('Reject Order')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageTemplate>
    );
}
