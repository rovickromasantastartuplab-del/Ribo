import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, Package, Search, Filter, CheckCircle, XCircle, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { ImportModal } from '@/components/ImportModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockProducts, mockBrands, mockCategories, mockTaxes } from '@/data/mockCrmData';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ProductsIndex() {
    const { t } = useTranslation();

    // Mock dependencies
    const products = { data: mockProducts, total: mockProducts.length, from: 1, to: mockProducts.length, last_page: 1 };
    const categories = mockCategories;
    const brands = mockBrands;
    const taxes = mockTaxes;
    const users = []; // Mock users if needed
    const auth = { permissions: ['view-products', 'create-products', 'edit-products', 'delete-products', 'export-products', 'import-products'], user: { type: 'company' } };
    const permissions = auth.permissions;
    const isCompany = auth.user.type === 'company';

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [activeView, setActiveView] = useState('list');

    // Helpers
    const hasPermission = (perms, permission) => perms.includes(permission);

    const hasActiveFilters = () => {
        return searchTerm !== '' || selectedCategory !== 'all' || selectedBrand !== 'all' || selectedStatus !== 'all' || selectedAssignee !== 'all';
    };

    const activeFilterCount = () => {
        return (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedBrand !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedAssignee !== 'all' ? 1 : 0);
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        toast.info(t('Search is currently simulated with mock data'));
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
                toast.success(t('Status updated successfully (Simulated)'));
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
        toast.success(t(formMode === 'create' ? 'Product created successfully (Simulated)' : 'Product updated successfully (Simulated)'));
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        toast.success(t('Product deleted successfully (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedStatus('all');
        setSelectedAssignee('all');
        setShowFilters(false);
    };

    // Page Actions
    const pageActions = [];
    if (hasPermission(permissions, 'export-products')) {
        pageActions.push({
            label: t('Export'),
            icon: <Download className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => toast.info(t('Export functionality will be connected later'))
        });
    }
    if (hasPermission(permissions, 'import-products')) {
        pageActions.push({
            label: t('Import'),
            icon: <Upload className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => setIsImportModalOpen(true)
        });
    }
    if (hasPermission(permissions, 'create-products')) {
        pageActions.push({
            label: t('Add Product'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: handleAddNew
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Products') }
    ];

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (value, row) => {
                const mainImage = row.media?.find((m) => m.collection_name === 'main');
                const imageUrl = mainImage?.original_url || row.display_image_url || row.main_image_url || row.image;

                return (
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden p-1">
                            {imageUrl ? (
                                <img src={imageUrl} alt={row.name} className="max-h-full max-w-full object-contain rounded-lg" />
                            ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{row.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {row.sku}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'price',
            label: t('Price'),
            sortable: true,
            render: (value) => (
                <span className="font-semibold text-green-600">
                    {formatCurrency(parseFloat(value || 0))}
                </span>
            )
        },
        {
            key: 'stock_quantity',
            label: t('Stock'),
            sortable: true,
            render: (value) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value > 10 ? 'bg-green-100 text-green-800' :
                    value > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {value} {value === 1 ? t('unit') : t('units')}
                </span>
            )
        },
        {
            key: 'category',
            label: t('Category'),
            render: (value) => value?.name || t('-')
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
        }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Products")}
            url="/products"
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
                            name: 'category',
                            label: t('Category'),
                            type: 'select',
                            value: selectedCategory,
                            onChange: setSelectedCategory,
                            options: [
                                { value: 'all', label: t('All Categories') },
                                ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
                            ]
                        },
                        {
                            name: 'brand',
                            label: t('Brand'),
                            type: 'select',
                            value: selectedBrand,
                            onChange: setSelectedBrand,
                            options: [
                                { value: 'all', label: t('All Brands') },
                                ...brands.map(b => ({ value: b.id.toString(), label: b.name }))
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    onApplyFilters={handleSearch}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={setActiveView}
                />
            </div>

            {activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable
                        columns={columns}
                        actions={actions}
                        data={products?.data || []}
                        from={products?.from || 1}
                        onAction={handleAction}
                    />
                    <Pagination
                        from={products?.from || 0}
                        to={products?.to || 0}
                        total={products?.total || 0}
                        currentPage={1}
                        totalPages={1}
                        onPageChange={() => { }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {products?.data?.map((product) => (
                        <Card key={product.id} className="group overflow-hidden">
                            <div className="relative aspect-square bg-gray-50 p-4">
                                <img
                                    src={product.media?.[0]?.original_url || 'https://via.placeholder.com/200'}
                                    alt={product.name}
                                    className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {product.status === 'active' ? t('Active') : t('Inactive')}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</span>
                                    <span className="text-xs text-gray-500">{product.stock_quantity} {t('in stock')}</span>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => handleAction('view', product)}>
                                    {t('View Details')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Product Name'), type: 'text', required: true },
                        { name: 'sku', label: t('SKU'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'price', label: t('Price'), type: 'number', required: true },
                        { name: 'stock_quantity', label: t('Stock Quantity'), type: 'number' },
                        {
                            name: 'category_id',
                            label: t('Category'),
                            type: 'select',
                            options: categories.map(c => ({ value: c.id, label: c.name }))
                        },
                        {
                            name: 'brand_id',
                            label: t('Brand'),
                            type: 'select',
                            options: brands.map(b => ({ value: b.id, label: b.name }))
                        }
                    ],
                    modalSize: 'xl'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Product') : t('Edit Product')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('product')}
            />

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title={t('Import Products')}
            />
        </PageTemplate>
    );
}
