import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockSalesOrders, mockProducts } from '@/data/mockCrmData';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function SalesOrdersIndex() {
    const { t } = useTranslation();

    // Mock dependencies
    const salesOrders = { data: mockSalesOrders, total: mockSalesOrders.length, from: 1, to: mockSalesOrders.length };
    const auth = { permissions: ['view-sales-orders', 'create-sales-orders', 'edit-sales-orders', 'delete-sales-orders', 'export-sales-orders'] };
    const permissions = auth.permissions;

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const handleAction = (action, item) => {
        setCurrentItem(item);
        switch (action) {
            case 'view':
                setFormMode('view');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            default:
                break;
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Sales Orders') }
    ];

    const columns = [
        {
            key: 'order_number',
            label: t('Order Number'),
            sortable: true,
            render: (value) => (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                    {value}
                </span>
            )
        },
        { key: 'name', label: t('Name'), sortable: true },
        { key: 'account', label: t('Account'), render: (v) => v?.name || t('-') },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
        {
            key: 'total_amount',
            label: t('Total Amount'),
            render: (v) => formatCurrency(Number(v || 0))
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'shipped' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
                    {t(value.charAt(0).toUpperCase() + value.slice(1))}
                </span>
            )
        },
        {
            key: 'order_date',
            label: t('Order Date'),
            render: (v) => formatDateTime(v)
        }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Sales Orders")}
            url="/sales-orders"
            actions={[
                { label: t('Add Order'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setFormMode('create'); setIsFormModalOpen(true); } }
            ]}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={[
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: setSelectedStatus,
                            options: [
                                { value: 'all', label: t('All Statuses') },
                                { value: 'pending', label: t('Pending') },
                                { value: 'shipped', label: t('Shipped') },
                                { value: 'delivered', label: t('Delivered') }
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => selectedStatus !== 'all' || searchTerm !== ''}
                    onResetFilters={() => { setSearchTerm(''); setSelectedStatus('all'); setShowFilters(false); }}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={actions}
                    data={salesOrders.data}
                    from={1}
                    onAction={handleAction}
                />
                <Pagination total={salesOrders.total} from={1} to={salesOrders.total} />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={() => { toast.success(t('Order processing simulated')); setIsFormModalOpen(false); }}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'order_date', label: t('Order Date'), type: 'date', required: true },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'pending', label: t('Pending') },
                                { value: 'shipped', label: t('Shipped') },
                                { value: 'delivered', label: t('Delivered') }
                            ]
                        },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'Support User' }] }
                    ]
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Order') : t('Edit Order')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { toast.success(t('Order deleted (Simulated)')); setIsDeleteModalOpen(false); }}
                itemName={currentItem?.order_number || ''}
            />
        </PageTemplate>
    );
}
