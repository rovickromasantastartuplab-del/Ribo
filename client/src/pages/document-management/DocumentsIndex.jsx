import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Download, FileText, User, Calendar, Lock } from 'lucide-react';
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
const mockDocuments = [
    {
        id: 1,
        name: 'Annual Service Agreement',
        account: { id: 101, name: 'Global Corp' },
        folder: { id: 2, name: 'Legal' },
        type: { id: 1, type_name: 'PDF Document' },
        publish_date: '2024-01-01',
        expiration_date: '2024-12-31',
        attachment_name: 'agreement_2024.pdf',
        attachment_url: '#',
        assigned_user: { id: 201, name: 'John Doe' },
        status: 'active',
        created_at: '2024-01-01T09:00:00Z'
    },
    {
        id: 2,
        name: 'Project Timeline Q1',
        account: { id: 102, name: 'Tech Solutions' },
        folder: { id: 1, name: 'Main Category' },
        type: { id: 2, type_name: 'Word Document' },
        publish_date: '2024-01-15',
        attachment_name: 'timeline.docx',
        attachment_url: '#',
        assigned_user: { id: 202, name: 'Jane Smith' },
        status: 'active',
        created_at: '2024-01-15T11:30:00Z'
    },
];

export default function DocumentsIndex() {
    const { t } = useTranslation();
    const permissions = ['view-documents', 'create-documents', 'edit-documents', 'delete-documents', 'toggle-status-documents'];

    // State
    const [data, setData] = useState(mockDocuments);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [activeView, setActiveView] = useState('list');

    const hasActiveFilters = () => searchTerm !== '' || selectedAccount !== 'all' || selectedFolder !== 'all' || selectedType !== 'all' || selectedStatus !== 'all';
    const activeFilterCount = () => (searchTerm ? 1 : 0) + (selectedAccount !== 'all' ? 1 : 0) + (selectedFolder !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

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
                setData(prev => prev.map(d => d.id === item.id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d));
                break;
            case 'download':
                toast.success(t('Download started! (Simulated)'));
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
                account: { name: 'New Account' },
                folder: { name: 'General' },
                type: { type_name: 'PDF' }
            };
            setData([newItem, ...data]);
            toast.success(t('Document created successfully! (Simulated)'));
        } else {
            setData(data.map(d => d.id === currentItem.id ? { ...d, ...formData } : d));
            toast.success(t('Document updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(d => d.id !== currentItem.id));
        toast.success(t('Document deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedAccount('all');
        setSelectedFolder('all');
        setSelectedType('all');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Document Management') },
        { title: t('Documents') }
    ];

    const columns = [
        { key: 'name', label: t('Name'), sortable: true },
        { key: 'account', label: t('Account'), render: (value) => value?.name || t('-') },
        { key: 'folder', label: t('Folder'), render: (value) => value?.name || t('-') },
        { key: 'type', label: t('Type'), render: (value) => value?.type_name || t('-') },
        { key: 'publish_date', label: t('Publish Date'), sortable: true },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {value === 'active' ? t('Active') : t('Inactive')}
                </span>
            )
        },
        { key: 'created_at', label: t('Created At'), sortable: true, render: (value) => new Date(value).toLocaleDateString() }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Documents")}
            url="/documents"
            actions={[
                { label: t('Add Document'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                    showViewToggle
                    activeView={activeView}
                    onViewChange={setActiveView}
                />
            </div>

            {activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable
                        columns={columns}
                        actions={actions}
                        data={data}
                        from={1}
                        onAction={handleAction}
                        permissions={permissions}
                    />
                    <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("documents")} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((document) => (
                        <Card key={document.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{document.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{document.account?.name || t('No account')}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleAction('view', document)}><Eye className="h-4 w-4 mr-2" />{t("View")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', document)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" />{t("Edit")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', document)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" />{t("Delete")}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('Folder')}:</span>
                                        <span className="font-medium">{document.folder?.name || t('-')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('Type')}:</span>
                                        <span className="font-medium">{document.type?.type_name || t('-')}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center mb-4">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(document.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleAction('view', document)} className="flex-1 h-8 text-xs"><Eye className="h-3.5 w-3.5 mr-1.5" />{t("View")}</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleAction('edit', document)} className="flex-1 h-8 text-xs"><Edit className="h-3.5 w-3.5 mr-1.5" />{t("Edit")}</Button>
                                </div>
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
                        { name: 'name', label: t('Document Name'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'status', label: t('Status'), type: 'select', options: [{ value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }], defaultValue: 'active' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Document') : formMode === 'edit' ? t('Edit Document') : t('View Document')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('document')}
            />
        </PageTemplate>
    );
}
