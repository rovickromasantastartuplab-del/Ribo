import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Truck } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock Data
const mockShippingTypes = [
    { id: 1, name: 'Express', description: 'Fast delivery within 24h', color: '#10B981', status: 'active', created_at: '2024-01-20T10:00:00Z' },
    { id: 2, name: 'Standard', description: '3-5 business days', color: '#3B82F6', status: 'active', created_at: '2024-01-22T14:30:00Z' },
    { id: 3, name: 'Economical', description: 'Up to 10 days', color: '#6B7280', status: 'inactive', created_at: '2024-01-25T09:15:00Z' },
];

export default function ShippingProviderTypesIndex() {
    const { t } = useTranslation();
    const permissions = ['view-shipping-provider-types', 'create-shipping-provider-types', 'edit-shipping-provider-types', 'delete-shipping-provider-types', 'toggle-status-shipping-provider-types'];

    // State
    const [data, setData] = useState(mockShippingTypes);
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
                toast.success(t('Status updated! (Simulated)'));
                setData(prev => prev.map(s => s.id === item.id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
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
                status: formData.status || 'active'
            };
            setData([newItem, ...data]);
            toast.success(t('Type created successfully! (Simulated)'));
        } else {
            setData(data.map(s => s.id === currentItem.id ? { ...s, ...formData } : s));
            toast.success(t('Type updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(s => s.id !== currentItem.id));
        toast.success(t('Type deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Shipping Provider Types') }
    ];

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (v, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
                        <div className="text-xs text-gray-500">{row.description}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {t(value.charAt(0).toUpperCase() + value.slice(1))}
                </span>
            )
        },
        { key: 'created_at', label: t('Created At'), render: (v) => new Date(v).toLocaleDateString() }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Shipping Provider Types")}
            url="/shipping-provider-types"
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
                <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("shipping provider types")} />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
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
                title={formMode === 'create' ? t('Add New Type') : formMode === 'edit' ? t('Edit Type') : t('View Type')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('shipping provider type')}
            />
        </PageTemplate>
    );
}
