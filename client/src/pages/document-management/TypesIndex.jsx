import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, FileIcon, Lock } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

// Mock Data
const mockTypes = [
    { id: 1, type_name: 'PDF Document', status: 'active', creator: { name: 'Admin' }, created_at: '2024-01-20T10:00:00Z' },
    { id: 2, type_name: 'Word Document', status: 'active', creator: { name: 'Admin' }, created_at: '2024-01-22T14:30:00Z' },
    { id: 3, type_name: 'Excel Spreadsheet', status: 'active', creator: { name: 'Admin' }, created_at: '2024-01-25T09:15:00Z' },
    { id: 4, type_name: 'Image (PNG/JPG)', status: 'inactive', creator: { name: 'Admin' }, created_at: '2023-12-01T11:00:00Z' },
];

export default function TypesIndex() {
    const { t } = useTranslation();
    const permissions = ['view-document-types', 'create-document-types', 'edit-document-types', 'delete-document-types', 'toggle-status-document-types'];

    // State
    const [data, setData] = useState(mockTypes);
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
                setData(prev => prev.map(t => t.id === item.id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t));
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
                creator: { name: 'Admin' }
            };
            setData([newItem, ...data]);
            toast.success(t('Document type created successfully! (Simulated)'));
        } else {
            setData(data.map(t => t.id === currentItem.id ? { ...t, ...formData } : t));
            toast.success(t('Document type updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(t => t.id !== currentItem.id));
        toast.success(t('Document type deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Document Management') },
        { title: t('Types') }
    ];

    const columns = [
        {
            key: 'type_name',
            label: t('Type Name'),
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <FileIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-medium">{row.type_name}</div>
                    </div>
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
        {
            key: 'creator',
            label: t('Created By'),
            render: (value) => value?.name || t('-')
        },
        {
            key: 'created_at',
            label: t('Created At'),
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
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
            title={t("Types")}
            url="/document-types"
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

                <Pagination
                    from={1}
                    to={data.length}
                    total={data.length}
                    links={[]}
                    entityName={t("document types")}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'type_name', label: t('Type Name'), type: 'text', required: true },
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
                title={formMode === 'create' ? t('Add New Document Type') : formMode === 'edit' ? t('Edit Document Type') : t('View Document Type')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.type_name || ''}
                entityName={t('document type')}
            />
        </PageTemplate>
    );
}
