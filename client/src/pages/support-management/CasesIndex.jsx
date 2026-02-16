import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, MessageSquare, AlertCircle, Clock, Lock } from 'lucide-react';
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
const mockCases = [
    {
        id: 1,
        subject: 'Database connection error',
        description: 'Trying to connect but getting timeout.',
        account: { name: 'Global Corp' },
        contact: { name: 'Alice Smith' },
        priority: 'high',
        status: 'new',
        case_type: 'bug',
        assigned_users: [{ name: 'Tech Support' }],
        created_at: '2024-02-14T10:00:00Z'
    },
    {
        id: 2,
        subject: 'Billing inquiry Q1',
        description: 'Need clarification on the latest invoice.',
        account: { name: 'Fast Startup' },
        contact: { name: 'Bob Jones' },
        priority: 'medium',
        status: 'in_progress',
        case_type: 'inquiry',
        assigned_users: [{ name: 'Finance Admin' }],
        created_at: '2024-02-15T14:30:00Z'
    },
];

export default function CasesIndex() {
    const { t } = useTranslation();
    const permissions = ['view-cases', 'create-cases', 'edit-cases', 'delete-cases', 'toggle-status-cases'];

    // State
    const [data, setData] = useState(mockCases);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [activeView, setActiveView] = useState('list');

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
                toast.success(t('Status toggled! (Simulated)'));
                setData(prev => prev.map(c => c.id === item.id ? { ...c, status: c.status === 'closed' ? 'new' : 'closed' } : c));
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
                account: { name: 'Default' },
                contact: { name: 'Default' },
                assigned_users: [{ name: 'Support' }]
            };
            setData([newItem, ...data]);
            toast.success(t('Case created successfully! (Simulated)'));
        } else {
            setData(data.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
            toast.success(t('Case updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(c => c.id !== currentItem.id));
        toast.success(t('Case deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Cases') }
    ];

    const columns = [
        { key: 'subject', label: t('Subject'), sortable: true },
        { key: 'account', label: t('Account'), render: (v) => v?.name || '-' },
        {
            key: 'priority',
            label: t('Priority'),
            render: (v) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${v === 'high' || v === 'urgent' ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>
                    {t(v.charAt(0).toUpperCase() + v.slice(1))}
                </span>
            )
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => {
                const colors = {
                    new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
                    in_progress: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
                    resolved: 'bg-green-50 text-green-700 ring-green-600/20',
                    closed: 'bg-gray-50 text-gray-700 ring-gray-600/20'
                };
                return (
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[value] || 'bg-gray-50'}`}>
                        {t(value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1))}
                    </span>
                );
            }
        },
        { key: 'case_type', label: t('Type'), render: (v) => t(v.charAt(0).toUpperCase() + v.slice(1)) },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
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
            title={t("Cases")}
            url="/cases"
            actions={[
                { label: t('Add Case'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                                { value: 'new', label: t('New') },
                                { value: 'in_progress', label: t('In Progress') },
                                { value: 'resolved', label: t('Resolved') },
                                { value: 'closed', label: t('Closed') }
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
                    <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("cases")} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((caseItem) => (
                        <Card key={caseItem.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{caseItem.subject}</h3>
                                            <p className="text-xs text-gray-500">#{caseItem.id}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction('view', caseItem)}><Eye className="h-4 w-4 mr-2" />{t("View")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', caseItem)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" />{t("Edit")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', caseItem)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" />{t("Delete")}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                        {caseItem.account?.name}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="h-3.5 w-3.5 mr-2" />
                                        {t('Created')}: {new Date(caseItem.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${caseItem.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {t(caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1))}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t">
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${caseItem.status === 'new' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                        {t(caseItem.status.replace('_', ' ').charAt(0).toUpperCase() + caseItem.status.replace('_', ' ').slice(1))}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('edit', caseItem)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('view', caseItem)}><Eye className="h-4 w-4" /></Button>
                                    </div>
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
                        { name: 'subject', label: t('Subject'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        {
                            name: 'priority',
                            label: t('Priority'),
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'low', label: t('Low') },
                                { value: 'medium', label: t('Medium') },
                                { value: 'high', label: t('High') },
                                { value: 'urgent', label: t('Urgent') }
                            ],
                            defaultValue: 'medium'
                        },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'new', label: t('New') },
                                { value: 'in_progress', label: t('In Progress') },
                                { value: 'resolved', label: t('Resolved') },
                                { value: 'closed', label: t('Closed') }
                            ],
                            defaultValue: 'new'
                        },
                        {
                            name: 'case_type',
                            label: t('Case Type'),
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'support', label: t('Support') },
                                { value: 'bug', label: t('Bug') },
                                { value: 'feature_request', label: t('Feature Request') },
                                { value: 'complaint', label: t('Complaint') },
                                { value: 'inquiry', label: t('Inquiry') }
                            ],
                            defaultValue: 'support'
                        },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'Support User' }] }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Case') : formMode === 'edit' ? t('Edit Case') : t('View Case')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.subject || ''}
                entityName={t('case')}
            />
        </PageTemplate>
    );
}
