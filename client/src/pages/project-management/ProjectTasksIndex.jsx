import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, CheckCircle, Clock, Calendar, CheckSquare } from 'lucide-react';
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
const mockTasks = [
    {
        id: 1,
        title: 'Setup Database Schema',
        description: 'Design and implement the initial DB schema.',
        project: { name: 'CRM Redesign' },
        parent: null,
        priority: 'high',
        task_status_id: 2,
        assigned_users: [{ name: 'John Doe' }],
        due_date: '2024-02-15',
        progress: 60,
        status: 'in_progress',
        created_at: '2024-01-20T10:00:00Z'
    },
    {
        id: 2,
        title: 'API Authentication',
        description: 'Implement JWT based auth.',
        project: { name: 'CRM Redesign' },
        parent: { title: 'Setup Database Schema' },
        priority: 'urgent',
        task_status_id: 1,
        assigned_users: [{ name: 'Jane Smith' }],
        due_date: '2024-02-20',
        progress: 10,
        status: 'to_do',
        created_at: '2024-01-22T14:30:00Z'
    },
];

const mockStatuses = [
    { id: 1, name: 'To Do', color: '#6B7280' },
    { id: 2, name: 'In Progress', color: '#3B82F6' },
    { id: 3, name: 'Done', color: '#10B981' },
];

export default function ProjectTasksIndex() {
    const { t } = useTranslation();
    const permissions = ['view-project-tasks', 'create-project-tasks', 'edit-project-tasks', 'delete-project-tasks', 'toggle-status-project-tasks'];

    // State
    const [data, setData] = useState(mockTasks);
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
                toast.success(t('Status toggled successfully! (Simulated)'));
                setData(prev => prev.map(task => task.id === item.id ? { ...task, status: task.status === 'done' ? 'to_do' : 'done', progress: task.status === 'done' ? 0 : 100 } : task));
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
                project: { name: 'Default Project' },
                task_status_id: formData.task_status_id || 1,
                assigned_users: [{ name: 'Admin' }],
                status: 'to_do',
                progress: formData.progress || 0
            };
            setData([newItem, ...data]);
            toast.success(t('Task created successfully! (Simulated)'));
        } else {
            setData(data.map(task => task.id === currentItem.id ? { ...task, ...formData } : task));
            toast.success(t('Task updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(task => task.id !== currentItem.id));
        toast.success(t('Task deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Project Management') },
        { title: t('Project Tasks') }
    ];

    const columns = [
        { key: 'title', label: t('Title'), sortable: true },
        { key: 'project', label: t('Project'), render: (v) => v?.name || '-' },
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
            key: 'task_status',
            label: t('Status'),
            render: (v, item) => {
                const status = mockStatuses.find(s => s.id === item.task_status_id);
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status?.color || '#6B7280' }}></div>
                        <span className="text-sm font-medium">{status?.name || t('No Status')}</span>
                    </div>
                );
            }
        },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
        { key: 'due_date', label: t('Due Date') }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'CheckCircle', action: 'toggle-status', className: 'text-green-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Project Tasks")}
            url="/project-tasks"
            actions={[
                { label: t('Add Task'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                                ...mockStatuses.map(s => ({ value: s.id.toString(), label: s.name }))
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
                    <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("tasks")} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((task) => (
                        <Card key={task.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                                            <CheckSquare className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{task.title}</h3>
                                            <p className="text-xs text-gray-500">{task.project?.name || t('No project')}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction('view', task)}><Eye className="h-4 w-4 mr-2" />{t("View")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', task)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" />{t("Edit")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', task)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" />{t("Delete")}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{t('Progress')}</span>
                                            <span>{task.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 mr-2" />
                                        {t('Due')}: {task.due_date}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${task.priority === 'urgent' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mockStatuses.find(s => s.id === task.task_status_id)?.color || '#6B7280' }}></div>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {mockStatuses.find(s => s.id === task.task_status_id)?.name}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('edit', task)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('view', task)}><Eye className="h-4 w-4" /></Button>
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
                        { name: 'title', label: t('Task Title'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'due_date', label: t('Due Date'), type: 'date' },
                        {
                            name: 'priority',
                            label: t('Priority'),
                            type: 'select',
                            options: [
                                { value: 'low', label: t('Low') },
                                { value: 'medium', label: t('Medium') },
                                { value: 'high', label: t('High') },
                                { value: 'urgent', label: t('Urgent') }
                            ],
                            defaultValue: 'medium'
                        },
                        {
                            name: 'task_status_id',
                            label: t('Status'),
                            type: 'select',
                            options: mockStatuses.map(s => ({ value: s.id, label: s.name })),
                            defaultValue: 1
                        },
                        { name: 'progress', label: t('Progress (%)'), type: 'number', min: 0, max: 100, defaultValue: 0 },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'John Doe' }] }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Task') : formMode === 'edit' ? t('Edit Task') : t('View Task')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.title || ''}
                entityName={t('task')}
            />
        </PageTemplate>
    );
}
