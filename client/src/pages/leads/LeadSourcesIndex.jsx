import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { leadSourceService } from '@/services/leadSourceService';

export default function LeadSourcesIndex() {
    const { t } = useTranslation();

    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [fromItem, setFromItem] = useState(0);
    const [toItem, setToItem] = useState(0);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm,
                status: selectedStatus !== 'all' ? selectedStatus : undefined
            };

            const responseData = await leadSourceService.getAll(params);

            const items = responseData.data || [];

            setData(Array.isArray(items) ? items : []);
            setTotalItems(responseData.total || 0);
            setTotalPages(responseData.last_page || 1);
            setFromItem(responseData.from || 0);
            setToItem(responseData.to || 0);

        } catch (error) {
            console.error("Failed to fetch lead sources", error);
            toast.error(t('Failed to load lead sources'));
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, selectedStatus, searchTerm]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setCurrentPage(1);
        fetchData();
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' || selectedStatus !== 'all';
    };

    const activeFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (selectedStatus !== 'all') count++;
        return count;
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchData();
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
                handleToggleStatus(item);
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

    const handleFormSubmit = async (formData) => {
        try {
            if (formMode === 'create') {
                toast.loading(t('Creating lead source...'));
                await leadSourceService.create(formData);
                toast.success(t('Lead source created successfully'));
            } else if (formMode === 'edit') {
                toast.loading(t('Updating lead source...'));
                await leadSourceService.update(currentItem.id, formData);
                toast.success(t('Lead source updated successfully'));
            }
            setIsFormModalOpen(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || t('Operation failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            toast.loading(t('Deleting lead source...'));
            await leadSourceService.delete(currentItem.id);
            toast.success(t('Lead source deleted successfully'));
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || t('Delete failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            const newStatus = item.status === 'active' ? 'inactive' : 'active';
            toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} lead source...`);
            await leadSourceService.update(item.id, { status: newStatus });
            toast.success(t('Status updated successfully'));
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || t('Status update failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true
        },
        {
            key: 'description',
            label: t('Description'),
            render: (value) => value || '-'
        },
        {
            key: 'status',
            label: t('Status'),
            type: 'badge',
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                    : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                    }`}>
                    {value === 'active' ? t('Active') : t('Inactive')}
                </span>
            )
        },
        {
            key: 'created_at',
            label: t('Created At'),
            sortable: true,
            type: 'date'
        }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    const pageActions = [
        {
            label: t('Add Lead Source'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: handleAddNew
        }
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Lead Management'), href: '#' },
        { title: t('Lead Sources') }
    ];

    return (
        <PageTemplate
            title={t("Lead Sources")}
            url="/lead-sources"
            actions={pageActions}
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
                    onApplyFilters={handleApplyFilters}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={actions}
                    data={data}
                    from={fromItem}
                    onAction={handleAction}
                />
                <Pagination
                    from={fromItem}
                    to={toItem}
                    total={totalItems}
                    onPageChange={(page) => setCurrentPage(page)}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Source Name'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
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
                title={formMode === 'create' ? t('Add New Lead Source') : t('Edit Lead Source')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('lead source')}
            />
        </PageTemplate>
    );
}
