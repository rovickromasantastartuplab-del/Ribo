import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, Folder, Lock } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

// Mock Data
const mockFolders = [
    { id: 1, name: 'Main Category', description: 'Main business documents', parent_folder_id: null, status: 'active', created_at: '2024-01-20T10:00:00Z' },
    { id: 2, name: 'Legal', description: 'Contracts and agreements', parent_folder_id: 1, status: 'active', created_at: '2024-01-22T14:30:00Z', parent_folder: { name: 'Main Category' } },
    { id: 3, name: 'Financials', description: 'Reports and invoices', parent_folder_id: 1, status: 'active', created_at: '2024-01-25T09:15:00Z', parent_folder: { name: 'Main Category' } },
    { id: 4, name: 'Archive', description: 'Old documents', parent_folder_id: null, status: 'inactive', created_at: '2023-12-01T11:00:00Z' },
];

export default function FoldersIndex() {
    const { t } = useTranslation();
    const permissions = ['view-document-folders', 'create-document-folders', 'edit-document-folders', 'delete-document-folders', 'toggle-status-document-folders'];

    // State
    const [data, setData] = useState(mockFolders);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedParentFolder, setSelectedParentFolder] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const hasActiveFilters = () => searchTerm !== '' || selectedStatus !== 'all' || selectedParentFolder !== 'all';
    const activeFilterCount = () => (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedParentFolder !== 'all' ? 1 : 0);

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
                setData(prev => prev.map(f => f.id === item.id ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' } : f));
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
                parent_folder: formData.parent_folder_id !== 'null' ? { name: mockFolders.find(f => f.id.toString() === formData.parent_folder_id)?.name } : null
            };
            setData([newItem, ...data]);
            toast.success(t('Folder created successfully! (Simulated)'));
        } else {
            setData(data.map(f => f.id === currentItem.id ? { ...f, ...formData } : f));
            toast.success(t('Folder updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(f => f.id !== currentItem.id));
        toast.success(t('Folder deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedParentFolder('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Document Management') },
        { title: t('Folders') }
    ];

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Folder className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-sm text-muted-foreground">{row.description || t('No description')}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'parent_folder',
            label: t('Parent Folder'),
            render: (value) => value?.name || t('Root Folder')
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
            title={t("Folders")}
            url="/document-folders"
            actions={[
                { label: t('Add Folder'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                            name: 'parent_folder_id',
                            label: t('Parent Folder'),
                            type: 'select',
                            value: selectedParentFolder,
                            onChange: setSelectedParentFolder,
                            options: [
                                { value: 'all', label: t('All Folders') },
                                { value: 'null', label: t('Root Folders') },
                                ...mockFolders.filter(f => !f.parent_folder_id).map(f => ({ value: f.id.toString(), label: f.name }))
                            ]
                        },
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
                    entityName={t("document folders")}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Folder Name'), type: 'text', required: true },
                        {
                            name: 'parent_folder_id',
                            label: t('Parent Folder'),
                            type: 'select',
                            options: [
                                { value: 'null', label: t('Root Folder') },
                                ...mockFolders.filter(f => !f.parent_folder_id).map(f => ({ value: f.id, label: f.name }))
                            ]
                        },
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
                title={formMode === 'create' ? t('Add New Document Folder') : formMode === 'edit' ? t('Edit Document Folder') : t('View Document Folder')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('document folder')}
            />
        </PageTemplate>
    );
}
