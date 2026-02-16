import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { planRequestsConfig } from '@/config/crud/plan-requests';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

// Mock Data
const mockPlanRequests = [
    {
        id: 1,
        user: { name: 'John Doe', email: 'john@example.com' },
        plan: { name: 'Enterprise Plan' },
        duration: 'yearly',
        status: 'pending',
        created_at: '2024-03-15T10:00:00Z'
    },
    {
        id: 2,
        user: { name: 'Sarah Smith', email: 'sarah@example.com' },
        plan: { name: 'Pro Plan' },
        duration: 'monthly',
        status: 'approved',
        created_at: '2024-03-14T15:30:00Z'
    },
    {
        id: 3,
        user: { name: 'Tech Corp', email: 'admin@techcorp.com' },
        plan: { name: 'Startup Plan' },
        duration: 'yearly',
        status: 'rejected',
        created_at: '2024-03-12T09:15:00Z'
    }
];

export default function PlanRequestsIndex() {
    const { t } = useTranslation();
    const [data, setData] = useState(mockPlanRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState({ status: 'all' });
    const [showFilters, setShowFilters] = useState(false);

    const handleAction = (action, item) => {
        if (action === 'approve') {
            toast.success(t('Plan request approved successfully'));
            setData(data.map(d => d.id === item.id ? { ...d, status: 'approved' } : d));
        } else if (action === 'reject') {
            toast.success(t('Plan request rejected'));
            setData(data.map(d => d.id === item.id ? { ...d, status: 'rejected' } : d));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock search logic would go here
    };

    const handleFilterChange = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterValues.status === 'all' || item.status === filterValues.status;

        return matchesSearch && matchesStatus;
    });

    const activeFilterCount = () => {
        return (filterValues.status !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Plans'), href: '/plans' },
        { title: t('Plan Requests') }
    ];

    return (
        <PageTemplate
            title={t('Plan Requests')}
            description={t('Manage plan upgrade requests from users')}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={planRequestsConfig.filters.map(filter => ({
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
                    columns={planRequestsConfig.table.columns.map(col => ({
                        ...col,
                        label: t(col.label),
                        render: col.render // Preserve render function from config
                    }))}
                    actions={planRequestsConfig.table.actions.map(action => ({
                        ...action,
                        label: t(action.label)
                    }))}
                    data={filteredData}
                    onAction={handleAction}
                    permissions={['approve-plan-requests', 'reject-plan-requests']} // Grant permissions for demo
                />
                <Pagination
                    from={1}
                    to={filteredData.length}
                    total={filteredData.length}
                    links={[]} // No pagination in mock
                    entityName={t("plan requests")}
                    onPageChange={() => { }}
                />
            </div>
        </PageTemplate>
    );
}
