import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Phone, Clock, Calendar, Lock } from 'lucide-react';
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
const mockCalls = [
    {
        id: 1,
        title: 'Follow up with Global Corp',
        description: 'Check on the proposal status.',
        start_date: '2024-02-16',
        start_time: '10:00',
        end_time: '10:15',
        status: 'planned',
        assigned_user: { name: 'John Doe' },
        created_at: '2024-02-14T10:00:00Z'
    },
    {
        id: 2,
        title: 'Initial Discovery Call',
        description: 'New lead intro.',
        start_date: '2024-02-15',
        start_time: '14:00',
        end_time: '14:30',
        status: 'held',
        assigned_user: { name: 'Jane Smith' },
        created_at: '2024-02-15T09:30:00Z'
    },
];

export default function CallsIndex() {
    const { t } = useTranslation();
    const permissions = ['view-calls', 'create-calls', 'edit-calls', 'delete-calls', 'toggle-status-calls'];

    // State
    const [data, setData] = useState(mockCalls);
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
                toast.success(t('Status updated! (Simulated)'));
                setData(prev => prev.map(c => c.id === item.id ? { ...c, status: c.status === 'held' ? 'planned' : 'held' } : c));
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
                assigned_user: { name: 'Admin' },
                status: formData.status || 'planned'
            };
            setData([newItem, ...data]);
            toast.success(t('Call created successfully! (Simulated)'));
        } else {
            setData(data.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
            toast.success(t('Call updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(c => c.id !== currentItem.id));
        toast.success(t('Call deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Calls') }
    ];

    const columns = [
        { key: 'title', label: t('Title'), sortable: true },
        {
            key: 'start_date',
            label: t('Date & Time'),
            sortable: true,
            render: (v, row) => (
                <div>
                    <div className="font-medium">{row.start_date}</div>
                    <div className="text-xs text-gray-500">{row.start_time} - {row.end_time}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => {
                const colors = {
                    planned: 'bg-blue-50 text-blue-700 ring-blue-600/20',
                    held: 'bg-green-50 text-green-700 ring-green-600/20',
                    not_held: 'bg-red-50 text-red-700 ring-red-600/20'
                };
                return (
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[value] || 'bg-gray-50'}`}>
                        {t(value.charAt(0).toUpperCase() + value.slice(1))}
                    </span>
                );
            }
        },
        { key: 'assigned_user', label: t('Assigned To'), render: (v) => v?.name || t('Unassigned') },
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
            title={t("Calls")}
            url="/calls"
            actions={[
                { label: t('Add Call'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                                { value: 'planned', label: t('Planned') },
                                { value: 'held', label: t('Held') },
                                { value: 'not_held', label: t('Not Held') }
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
                    <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("calls")} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((call) => (
                        <Card key={call.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{call.title}</h3>
                                            <p className="text-xs text-gray-500">{call.start_date}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction('view', call)}><Eye className="h-4 w-4 mr-2" />{t("View")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', call)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" />{t("Edit")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', call)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" />{t("Delete")}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="h-3.5 w-3.5 mr-2" />
                                        {call.start_time} - {call.end_time}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t">
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${call.status === 'planned' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                        {t(call.status.charAt(0).toUpperCase() + call.status.slice(1))}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('edit', call)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('view', call)}><Eye className="h-4 w-4" /></Button>
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
                        { name: 'title', label: t('Call Title'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'start_date', label: t('Start Date'), type: 'date', required: true },
                        { name: 'start_time', label: t('Start Time'), type: 'time', required: true },
                        { name: 'end_time', label: t('End Time'), type: 'time', required: true },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'planned', label: t('Planned') },
                                { value: 'held', label: t('Held') },
                                { value: 'not_held', label: t('Not Held') }
                            ],
                            defaultValue: 'planned'
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Call') : formMode === 'edit' ? t('Edit Call') : t('View Call')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.title || ''}
                entityName={t('call')}
            />
        </PageTemplate>
    );
}
