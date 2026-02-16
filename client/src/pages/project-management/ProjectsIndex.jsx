import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Calendar, DollarSign, Briefcase, Lock } from 'lucide-react';
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
const mockProjects = [
    {
        id: 1,
        name: 'CRM Redesign',
        code: 'PRJ-001',
        budget: 50000,
        priority: 'high',
        status: 'active',
        assigned_users: [{ name: 'John Doe' }],
        account: { name: 'Global Corp' },
        start_date: '2024-01-01',
        end_date: '2024-06-30',
        created_at: '2024-01-20T10:00:00Z'
    },
    {
        id: 2,
        name: 'Mobile App V2',
        code: 'PRJ-002',
        budget: 75000,
        priority: 'medium',
        status: 'on_hold',
        assigned_users: [{ name: 'Jane Smith' }],
        account: { name: 'Tech Solutions' },
        start_date: '2024-02-15',
        end_date: '2024-12-31',
        created_at: '2024-01-22T14:30:00Z'
    },
];

export default function ProjectsIndex() {
    const { t } = useTranslation();
    const permissions = ['view-projects', 'create-projects', 'edit-projects', 'delete-projects', 'toggle-status-projects'];

    // State
    const [data, setData] = useState(mockProjects);
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
                toast.success(t('Status updated successfully! (Simulated)'));
                setData(prev => prev.map(p => p.id === item.id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
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
                assigned_users: [{ name: 'Admin' }],
                account: { name: 'General' }
            };
            setData([newItem, ...data]);
            toast.success(t('Project created successfully! (Simulated)'));
        } else {
            setData(data.map(p => p.id === currentItem.id ? { ...p, ...formData } : p));
            toast.success(t('Project updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(p => p.id !== currentItem.id));
        toast.success(t('Project deleted successfully! (Simulated)'));
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
        { title: t('Projects') }
    ];

    const formatCurrency = (val) => `$${parseFloat(val || 0).toLocaleString()}`;

    const columns = [
        { key: 'name', label: t('Name'), sortable: true },
        { key: 'code', label: t('Code'), sortable: true, render: (v) => v || '-' },
        { key: 'budget', label: t('Budget'), render: (v) => formatCurrency(v) },
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
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {t(value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1))}
                </span>
            )
        },
        { key: 'start_date', label: t('Start Date') }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Projects")}
            url="/projects"
            actions={[
                { label: t('Add Project'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                                { value: 'completed', label: t('Completed') },
                                { value: 'on_hold', label: t('On Hold') }
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
                    <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("projects")} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((project) => (
                        <Card key={project.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{project.name}</h3>
                                            <p className="text-xs text-gray-500">{project.code || t('No code')}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction('view', project)}><Eye className="h-4 w-4 mr-2" />{t("View")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', project)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" />{t("Edit")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', project)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" />{t("Delete")}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 mr-2" />
                                        {project.start_date} - {project.end_date}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <DollarSign className="h-3.5 w-3.5 mr-2" />
                                        {t('Budget')}: {formatCurrency(project.budget)}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${project.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {t(project.priority.charAt(0).toUpperCase() + project.priority.slice(1))}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t">
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${project.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {t(project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1))}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('edit', project)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('view', project)}><Eye className="h-4 w-4" /></Button>
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
                        { name: 'name', label: t('Project Name'), type: 'text', required: true },
                        { name: 'code', label: t('Project Code'), type: 'text' },
                        { name: 'start_date', label: t('Start Date'), type: 'date' },
                        { name: 'end_date', label: t('End Date'), type: 'date' },
                        { name: 'budget', label: t('Budget'), type: 'number' },
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
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'active', label: t('Active') },
                                { value: 'completed', label: t('Completed') },
                                { value: 'on_hold', label: t('On Hold') }
                            ],
                            defaultValue: 'active'
                        },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'John Doe' }] }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Project') : formMode === 'edit' ? t('Edit Project') : t('View Project')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('project')}
            />
        </PageTemplate>
    );
}
