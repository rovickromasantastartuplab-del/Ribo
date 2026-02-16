import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { opportunityStageService } from '@/services/opportunityStageService';

export default function OpportunityStagesIndex() {
    const { t } = useTranslation();
    const { toast } = useToast();

    // Mock Permission Hook (would be real in full app)
    const auth = { user: { type: 'company' }, permissions: ['view-opportunity-stages', 'create-opportunity-stages', 'edit-opportunity-stages', 'delete-opportunity-stages', 'toggle-status-opportunity-stages'] };
    const permissions = auth?.permissions || [];

    // State
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params = {
                search: searchTerm,
                status: selectedStatus !== 'all' ? selectedStatus : undefined
            };
            const response = await opportunityStageService.getAll(params);
            // Handle both array and paginated response
            const items = response.data || response;
            setData(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("Failed to fetch stages:", error);
            toast({
                title: t("Error"),
                description: t("Failed to load opportunity stages"),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchTerm, selectedStatus]);

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

    const handleToggleStatus = async (item) => {
        try {
            await opportunityStageService.toggleStatus(item.id);
            toast({ title: t("Status Updated") });
            fetchData();
        } catch (error) {
            console.error("Failed to toggle status:", error);
            toast({ title: t("Error"), description: t("Failed to update status"), variant: "destructive" });
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await opportunityStageService.delete(currentItem.id);
            toast({ title: t("Stage Deleted") });
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
            toast({ title: t("Error"), description: t("Failed to delete stage"), variant: "destructive" });
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formMode === 'create') {
                await opportunityStageService.create(formData);
                toast({ title: t("Success"), description: t("Stage created successfully") });
            } else if (formMode === 'edit') {
                await opportunityStageService.update(currentItem.id, formData);
                toast({ title: t("Success"), description: t("Stage updated successfully") });
            }
            setIsFormModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Form submit error:", error);
            toast({ title: t("Error"), description: t("Operation failed"), variant: "destructive" });
        }
    };

    // Columns
    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (value, item) => (
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{value}</span>
                </div>
            )
        },
        {
            key: 'probability',
            label: t('Probability'),
            sortable: true,
            render: (value) => `${value}%`
        },
        {
            key: 'description',
            label: t('Description'),
            render: (value) => value || t('-')
        },
        {
            key: 'status',
            label: t('Status'),
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
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        }
    ];

    const actions = [
        {
            label: t('View'),
            icon: 'Eye',
            action: 'view',
            className: 'text-blue-500',
            requiredPermission: 'view-opportunity-stages'
        },
        {
            label: t('Edit'),
            icon: 'Edit',
            action: 'edit',
            className: 'text-amber-500',
            requiredPermission: 'edit-opportunity-stages'
        },
        {
            label: t('Delete'),
            icon: 'Trash2',
            action: 'delete',
            className: 'text-red-500',
            requiredPermission: 'delete-opportunity-stages'
        }
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Opportunity Management') },
        { title: t('Opportunity Stages') }
    ];

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
    };

    return (
        <PageTemplate
            title={t("Opportunity Stages")}
            url="/opportunity-stages"
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="p-4">
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
                                    { value: 'all', label: t('All Status') },
                                    { value: 'active', label: t('Active') },
                                    { value: 'inactive', label: t('Inactive') }
                                ]
                            }
                        ]}
                        showFilters={true}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFilterCount}
                        onResetFilters={handleResetFilters}
                        customActions={[
                            {
                                label: t('Add Stage'),
                                icon: <Plus className="h-4 w-4" />,
                                onClick: handleAddNew
                            }
                        ]}
                    />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable
                        columns={columns}
                        actions={actions}
                        data={data}
                        onAction={handleAction}
                        permissions={permissions}
                        entityPermissions={{
                            view: 'view-opportunity-stages',
                            create: 'create-opportunity-stages',
                            edit: 'edit-opportunity-stages',
                            delete: 'delete-opportunity-stages'
                        }}
                    />
                </div>
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Stage Name'), type: 'text', required: true },
                        { name: 'color', label: t('Color'), type: 'color', required: true, defaultValue: '#3B82F6' },
                        { name: 'probability', label: t('Probability (%)'), type: 'number', required: true, min: '0', max: '100', defaultValue: '0' },
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
                title={formMode === 'create' ? t('Add New Opportunity Stage') : formMode === 'edit' ? t('Edit Opportunity Stage') : t('View Opportunity Stage')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name}
                entityName={t("Opportunity Stage")}
            />
        </PageTemplate>
    );
}
