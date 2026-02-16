import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, Lock } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

// Mock Data
const mockCampaignTypes = [
    { id: 1, name: 'Email Marketing', description: 'Monthly newsletters and promos', color: '#3B82F6', status: 'active', created_at: '2024-01-20T10:00:00Z' },
    { id: 2, name: 'Cold Calling', description: 'Outbound sales calls', color: '#EF4444', status: 'active', created_at: '2024-01-22T14:30:00Z' },
    { id: 3, name: 'Social Media', description: 'Ads on Facebook/Instagram', color: '#10B981', status: 'active', created_at: '2024-01-25T09:15:00Z' },
    { id: 4, name: 'Webinar', description: 'Educational sessions', color: '#F59E0B', status: 'inactive', created_at: '2023-12-01T11:00:00Z' },
];

export default function CampaignTypesIndex() {
    const { t } = useTranslation();
    const permissions = ['view-campaign-types', 'create-campaign-types', 'edit-campaign-types', 'delete-campaign-types', 'toggle-status-campaign-types'];

    // State
    const [data, setData] = useState(mockCampaignTypes);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const hasActiveFilters = () => searchTerm !== '' || selectedStatus !== 'all';
    const activeFilterCount = () => (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        toast.info(t('Search is simulated'));
    };

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
            case 'toggle-status':
                toast.success(t('Status updated successfully! (Simulated)'));
                setData(prev => prev.map(tc => tc.id === item.id ? { ...tc, status: tc.status === 'active' ? 'inactive' : 'active' } : tc));
                break;
            default:
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        if (formMode === 'create') {
            const newItem = {
                ...formData,
                id: data.length + 1,
                created_at: new Date().toISOString(),
                status: formData.status || 'active',
            };
            setData([newItem, ...data]);
            toast.success(t('Campaign type created successfully! (Simulated)'));
        } else {
            setData(data.map(tc => tc.id === currentItem.id ? { ...tc, ...formData } : tc));
            toast.success(t('Campaign type updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(tc => tc.id !== currentItem.id));
        toast.success(t('Campaign type deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Campaign Management') },
        { title: t('Types') }
    ];

    const columns = [
        { key: 'name', label: t('Name'), sortable: true },
        { key: 'description', label: t('Description'), render: (v) => v || '-' },
        {
            key: 'color',
            label: t('Color'),
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: value || '#3B82F6' }}></div>
                    <span className="text-sm text-gray-600 font-mono">{value || '#3B82F6'}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {value === 'active' ? t('Active') : t('Inactive')}
                </span>
            )
        },
        { key: 'created_at', label: t('Created At'), sortable: true, render: (v) => new Date(v).toLocaleDateString() }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Campaign Types")}
            url="/campaign-types"
            actions={[
                { label: t('Add Type'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
            ]}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: setSelectedStatus,
                            options: [
                                { value: 'all', label: t('All Status') },
                                { value: 'active', label: t('Active') },
                                { value: 'inactive', label: t('Inactive') }
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={actions}
                    data={data}
                    from={1}
                    onAction={handleAction}
                    permissions={permissions}
                />
                <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("campaign types")} />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Type Name'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'color', label: t('Color'), type: 'color', defaultValue: '#3B82F6' },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'active', label: t('Active') },
                                { value: 'inactive', label: t('Inactive') }
                            ],
                            defaultValue: 'active'
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Campaign Type') : formMode === 'edit' ? t('Edit Campaign Type') : t('View Campaign Type')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('campaign type')}
            />
        </PageTemplate>
    );
}
