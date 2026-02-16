import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Filter, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from './CrudTable';
import { CrudFormModal } from './CrudFormModal';
import { CrudDeleteModal } from './CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';

// Mock hook to replace usePage().props
const useCrudData = (entityName) => {
    // Return mock data based on entity name
    const [data, setData] = useState({
        data: [],
        links: [],
        from: 1,
        to: 1,
        total: 0
    });

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            const mockItems = Array.from({ length: 5 }).map((_, i) => ({
                id: i + 1,
                name: `${entityName} ${i + 1}`,
                code: `CODE-${i + 1}`,
                status: true,
                created_at: new Date().toISOString(),
                // Add specific fields for coupons/currencies if needed
                type: 'percentage',
                discount_amount: 10,
                symbol: '$'
            }));

            setData({
                data: mockItems,
                links: [],
                from: 1,
                to: 5,
                total: 5
            });
        }, 500);
    }, [entityName]);

    return {
        [entityName]: data,
        auth: { permissions: ['view-coupons', 'create-coupons', 'edit-coupons', 'delete-coupons', 'manage-currencies'] }
    };
};

export function PageCrudWrapper({
    config,
    title,
    url,
    buttons = [],
    breadcrumbs
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { entity, table, filters = [], form, hooks } = config;

    // Use mock data hook
    const { [entity.name]: data, auth } = useCrudData(entity.name);
    const permissions = auth?.permissions || [];

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    // Check if any filters are active
    const hasActiveFilters = () => {
        return Object.entries(filterValues).some(([key, value]) => {
            return value && value !== '';
        }) || searchTerm !== '';
    };

    const activeFilterCount = () => {
        return Object.entries(filterValues).filter(([key, value]) => {
            return value && value !== '';
        }).length + (searchTerm ? 1 : 0);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        toast.info("Filters applied (Mock)");
        // In real app, update URL params
    };

    const handleFilterChange = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
        // In real app, trigger fetch
    };

    const handleSort = (field) => {
        toast.info(`Sorting by ${field} (Mock)`);
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
        toast.loading(formMode === 'create' ? t('Creating...') : t('Updating...'));

        setTimeout(() => {
            toast.dismiss();
            toast.success(t(`${entity.name} ${formMode === 'create' ? 'created' : 'updated'} successfully (Mock)`));
            setIsFormModalOpen(false);

            if (formMode === 'create' && hooks?.afterCreate) {
                hooks.afterCreate(formData, { props: { flash: { success: 'Created (Mock)' } } });
            } else if (formMode === 'edit' && hooks?.afterUpdate) {
                hooks.afterUpdate(formData, { props: { flash: { success: 'Updated (Mock)' } } });
            }
        }, 1000);
    };

    const handleDeleteConfirm = () => {
        toast.loading(t('Deleting...'));
        setTimeout(() => {
            toast.dismiss();
            toast.success(t(`${entity.name} deleted successfully (Mock)`));
            setIsDeleteModalOpen(false);
            if (hooks?.afterDelete) {
                hooks.afterDelete(currentItem?.id);
            }
        }, 1000);
    };

    const handleResetFilters = () => {
        setFilterValues({});
        setSearchTerm('');
        setShowFilters(false);
        toast.info("Filters reset (Mock)");
    };

    // Check if we should show the add button
    const showAddBtn = buttons.every(button => button.showAddButton !== false);

    // Define page actions
    const pageActions = [];

    // Add custom buttons with permission check
    buttons.forEach(button => {
        if (!button.permission || hasPermission(permissions, button.permission)) {
            pageActions.push({
                label: button.label,
                icon: button.icon,
                variant: button.variant,
                onClick: button.onClick
            });
        }
    });

    // Add the default "Add New" button if allowed and user has permission
    if (showAddBtn && hasPermission(permissions, entity.permissions?.create)) {
        pageActions.push({
            label: `Add New ${entity.name.slice(0, -1).charAt(0).toUpperCase() + entity.name.slice(0, -1).slice(1)}`,
            icon: <Plus className="h-4 w-4" />,
            variant: 'default',
            onClick: () => handleAddNew()
        });
    }

    const pageTitle = title || entity.name.charAt(0).toUpperCase() + entity.name.slice(1);
    const defaultBreadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: pageTitle }
    ];

    return (
        <PageTemplate
            title={pageTitle}
            url={url}
            actions={pageActions}
            breadcrumbs={breadcrumbs || defaultBreadcrumbs}
            noPadding
        >
            {/* Search and filters section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search ${entity.name}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9"
                                    />
                                </div>
                                <Button type="submit" size="sm">
                                    <Search className="h-4 w-4 mr-1.5" />
                                    {t("Search")}
                                </Button>
                            </form>

                            {filters.length > 0 && (
                                <div className="ml-2">
                                    <Button
                                        variant={hasActiveFilters() ? "default" : "outline"}
                                        size="sm"
                                        className="h-9"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                                        {showFilters ? 'Hide Filters' : 'Filters'}
                                        {hasActiveFilters() && (
                                            <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                {activeFilterCount()}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">{t("Per Page")}:</Label>
                            <Select defaultValue="10">
                                <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {showFilters && filters.length > 0 && (
                        <div className="w-full mt-3 p-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-md">
                            <div className="flex flex-wrap gap-4 items-end">
                                {filters.map((filter) => {
                                    const filterKey = filter.name || filter.key;
                                    return (
                                        <div key={filterKey} className="space-y-2">
                                            <Label>{filter.label}</Label>
                                            {filter.type === 'select' && (
                                                <Select
                                                    value={filterValues[filterKey] || ''}
                                                    onValueChange={(value) => handleFilterChange(filterKey, value)}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue placeholder={`All ${filter.label}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filter.options?.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    onClick={handleResetFilters}
                                    disabled={!hasActiveFilters()}
                                >
                                    {t("Reset Filters")}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={table.columns}
                    actions={table.actions}
                    data={data.data}
                    from={data.from || 1}
                    onAction={handleAction}
                    permissions={permissions}
                    entityPermissions={entity.permissions}
                    onSort={handleSort}
                />

                {/* Pagination section */}
                <Pagination
                    from={data.from || 0}
                    to={data.to || 0}
                    total={data.total}
                    links={data.links}
                    entityName={entity.name}
                    onPageChange={() => toast.info("Pagination (Mock)")}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    ...form,
                    modalSize: config.modalSize || form.modalSize
                }}
                initialData={currentItem}
                title={
                    formMode === 'create'
                        ? `Add New ${entity.name.slice(0, -1).charAt(0).toUpperCase() + entity.name.slice(0, -1).slice(1)}`
                        : formMode === 'edit'
                            ? `Edit ${entity.name.slice(0, -1).charAt(0).toUpperCase() + entity.name.slice(0, -1).slice(1)}`
                            : `View ${entity.name.slice(0, -1).charAt(0).toUpperCase() + entity.name.slice(0, -1).slice(1)}`
                }
                mode={formMode}
                description={config.description}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={entity.name.slice(0, -1)}
            />
        </PageTemplate>
    );
}
