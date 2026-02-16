import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, List, Columns, Grid3X3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { useInitials } from '@/hooks/use-initials';
import axios from 'axios';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function OpportunitiesIndex() {
    const { t } = useTranslation();
    const getInitials = useInitials();

    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [selectedStage, setSelectedStage] = useState('all');
    const [selectedSource, setSelectedSource] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [activeView, setActiveView] = useState('kanban');

    // Dropdown Data
    const [accounts, setAccounts] = useState([]);
    const [opportunityStages, setOpportunityStages] = useState([]);
    const [opportunitySources, setOpportunitySources] = useState([]);
    const [users, setUsers] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [fromItem, setFromItem] = useState(0);
    const [toItem, setToItem] = useState(0);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [isLoadingKanban, setIsLoadingKanban] = useState(false);
    const [kanbanData, setKanbanData] = useState(null);

    // Fetch Dependencies
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [accountsRes, stagesRes, sourcesRes, usersRes] = await Promise.all([
                    axios.get('/api/accounts?per_page=100').catch(() => ({ data: { data: [] } })),
                    axios.get('/api/opportunity-config/stages?per_page=100').catch(() => ({ data: { data: [] } })),
                    axios.get('/api/opportunity-config/sources?per_page=100').catch(() => ({ data: { data: [] } })),
                    axios.get('/api/users?per_page=100').catch(() => ({ data: { data: [] } }))
                ]);

                setAccounts(accountsRes.data.data || []);
                setOpportunityStages(stagesRes.data.data || []);
                setOpportunitySources(sourcesRes.data.data || []);
                setUsers(usersRes.data.data || []);
            } catch (error) {
                console.error("Failed to fetch dependencies", error);
            }
        };
        fetchDependencies();
    }, []);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        setIsLoadingKanban(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm,
                account_id: selectedAccount !== 'all' ? selectedAccount : undefined,
                opportunity_stage_id: selectedStage !== 'all' ? selectedStage : undefined,
                opportunity_source_id: selectedSource !== 'all' ? selectedSource : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                assigned_to: selectedAssignee !== 'all' ? selectedAssignee : undefined
            };

            const response = await axios.get('/api/opportunities', { params });
            const responseData = response.data;
            const items = responseData.data || [];

            // Transform data to handle assigned_users if backend returns assigned_user
            const transformedItems = items.map(item => ({
                ...item,
                assigned_users: item.assigned_users || (item.assigned_user ? [item.assigned_user] : [])
            }));

            setData(Array.isArray(transformedItems) ? transformedItems : []);
            setTotalItems(responseData.total || 0);
            setTotalPages(responseData.last_page || 1);
            setFromItem(responseData.from || 0);
            setToItem(responseData.to || 0);

            // Structure Kanban Data
            if (opportunityStages.length > 0) {
                const structuredData = {};
                opportunityStages.forEach(stage => {
                    structuredData[stage.id] = {
                        status: stage,
                        items: items.filter(op => (op.opportunity_stage?.id || op.opportunity_stage_id) === stage.id)
                    };
                });
                setKanbanData(structuredData);
            }
        } catch (error) {
            console.error("Failed to fetch opportunities", error);
            setData([]);
        } finally {
            setLoading(false);
            setIsLoadingKanban(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, selectedAccount, selectedStage, selectedSource, selectedStatus, selectedAssignee, searchTerm, opportunityStages]);

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
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            const newStatus = item.status === 'active' ? 'inactive' : 'active';
            toast.loading(t('Updating status...'));
            await axios.put(`/api/opportunities/${item.id}`, { ...item, status: newStatus });
            toast.success(t('Status updated successfully'));
            fetchData();
        } catch (error) {
            toast.error(t('Status update failed'));
        } finally {
            toast.dismiss();
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            toast.loading(t('Saving...'));
            if (formMode === 'create') {
                await axios.post('/api/opportunities', formData);
                toast.success(t('Opportunity created successfully'));
            } else {
                await axios.put(`/api/opportunities/${currentItem.id}`, formData);
                toast.success(t('Opportunity updated successfully'));
            }
            setIsFormModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('Save failed'));
        } finally {
            toast.dismiss();
        }
    };

    const handleDragStart = (e, opId) => {
        e.dataTransfer.setData('opportunityId', opId);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDrop = async (e, stageId) => {
        e.preventDefault();
        const opId = e.dataTransfer.getData('opportunityId');
        if (opId) {
            try {
                toast.loading(t('Updating stage...'));
                await axios.put(`/api/opportunities/${opId}`, { opportunity_stage_id: stageId });
                toast.success(t('Stage updated'));
                fetchData();
            } catch (error) {
                toast.error(t('Failed to update stage'));
            } finally {
                toast.dismiss();
            }
        }
        e.currentTarget.classList.remove('bg-blue-50');
    };

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (v, row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                        {getInitials(v)}
                    </div>
                    <div>
                        <div className="font-medium">{v}</div>
                        <div className="text-sm text-muted-foreground">{row.account?.name || t('No account')}</div>
                    </div>
                </div>
            )
        },
        { key: 'amount', label: t('Amount'), sortable: true, render: (v) => v ? formatCurrency(parseFloat(v)) : '-' },
        { key: 'close_date', label: t('Close Date'), sortable: true, render: (v) => formatDateTime(v, false) },
        {
            key: 'opportunity_stage',
            label: t('Stage'),
            render: (v) => v ? (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }}></div>
                    <span>{v.name}</span>
                </div>
            ) : '-'
        },
        { key: 'opportunity_source', label: t('Source'), render: (v) => v?.name || '-' },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
        {
            key: 'status',
            label: t('Status'),
            render: (v) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${v === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'}`}>
                    {t(v.charAt(0).toUpperCase() + v.slice(1))}
                </span>
            )
        },
        { key: 'created_at', label: t('Created At'), sortable: true, render: (v) => formatDateTime(v, false) }
    ];

    return (
        <PageTemplate
            title={t("Opportunities")}
            url="/opportunities"
            actions={[{ label: t('Add Opportunity'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setCurrentItem(null); setFormMode('create'); setIsFormModalOpen(true); } }]}
            breadcrumbs={[{ title: t('Dashboard'), href: '/' }, { title: t('Opportunity Management'), href: '#' }, { title: t('Opportunities') }]}
            noPadding
            className={activeView === 'kanban' ? 'overflow-hidden' : ''}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={(e) => { e.preventDefault(); setCurrentPage(1); fetchData(); }}
                    filters={[
                        { name: 'account_id', label: t('Account'), type: 'select', value: selectedAccount, onChange: setSelectedAccount, options: [{ value: 'all', label: t('All Accounts') }, ...accounts.map(a => ({ value: a.id.toString(), label: a.name }))] },
                        { name: 'opportunity_stage_id', label: t('Stage'), type: 'select', value: selectedStage, onChange: setSelectedStage, options: [{ value: 'all', label: t('All Stages') }, ...opportunityStages.map(s => ({ value: s.id.toString(), label: s.name }))] },
                        { name: 'opportunity_source_id', label: t('Source'), type: 'select', value: selectedSource, onChange: setSelectedSource, options: [{ value: 'all', label: t('All Sources') }, ...opportunitySources.map(s => ({ value: s.id.toString(), label: s.name }))] },
                        { name: 'status', label: t('Status'), type: 'select', value: selectedStatus, onChange: setSelectedStatus, options: [{ value: 'all', label: t('All Status') }, { value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }] },
                        { name: 'assigned_to', label: t('Assigned To'), type: 'select', value: selectedAssignee, onChange: setSelectedAssignee, options: [{ value: 'all', label: t('All Users') }, ...users.map(u => ({ value: u.id.toString(), label: u.name }))] }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => searchTerm !== '' || selectedAccount !== 'all' || selectedStage !== 'all' || selectedSource !== 'all' || selectedStatus !== 'all' || selectedAssignee !== 'all'}
                    onResetFilters={() => { setSearchTerm(''); setSelectedAccount('all'); setSelectedStage('all'); setSelectedSource('all'); setSelectedStatus('all'); setSelectedAssignee('all'); }}
                    onApplyFilters={() => { setCurrentPage(1); fetchData(); }}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={setActiveView}
                    viewOptions={[
                        { value: 'list', label: t('List View'), icon: 'List' },
                        { value: 'kanban', label: t('Kanban View'), icon: 'Columns' },
                        { value: 'grid', label: t('Grid View'), icon: 'Grid3X3' }
                    ]}
                />
            </div>

            {activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable columns={columns} actions={[{ label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' }, { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' }, { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' }, { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }]} data={data} from={fromItem} onAction={handleAction} />
                    <Pagination from={fromItem} to={toItem} total={totalItems} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
                </div>
            ) : activeView === 'kanban' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden h-full">
                    <div className="bg-gray-50 p-4 rounded-lg overflow-hidden h-full">
                        <style>{`
                .kanban-scroll { overflow-x: auto; overflow-y: hidden; }
                .kanban-scroll::-webkit-scrollbar { height: 8px; }
                .kanban-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .kanban-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .kanban-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}</style>
                        {isLoadingKanban ? (
                            <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll" style={{ height: 'calc(100vh - 280px)' }}>
                                {opportunityStages.map((stage) => {
                                    const stageOps = kanbanData?.[stage.id]?.items || [];
                                    return (
                                        <div key={stage.id} className="flex-shrink-0 w-[300px]" onDrop={(e) => handleDrop(e, stage.id)} onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50'); }} onDragLeave={(e) => e.currentTarget.classList.remove('bg-blue-50')}>
                                            <div className="bg-gray-100 rounded-lg h-full flex flex-col">
                                                <div className="p-3 border-b border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                                                            <h3 className="font-semibold text-sm text-gray-700 uppercase">{stage.name}</h3>
                                                        </div>
                                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{stageOps.length}</span>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full text-xs border-dashed" onClick={() => { setCurrentItem({ opportunity_stage_id: stage.id }); setFormMode('create'); setIsFormModalOpen(true); }}><Plus className="h-3 w-3 mr-1" />{t('Add Opportunity')}</Button>
                                                </div>
                                                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                                                    {stageOps.map((op) => (
                                                        <Card key={op.id} draggable onDragStart={(e) => handleDragStart(e, op.id)} onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50')} className="hover:shadow-md transition-all border-l-4 cursor-move" style={{ borderLeftColor: stage.color }}>
                                                            <div className="p-3">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleAction('view', op)}>{op.name}</h4>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-40"><DropdownMenuItem onClick={() => handleAction('view', op)}><Eye className="h-4 w-4 mr-2" />{t('View')}</DropdownMenuItem><DropdownMenuItem onClick={() => handleAction('edit', op)}><Edit className="h-4 w-4 mr-2" />{t('Edit')}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => handleAction('delete', op)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />{t('Delete')}</DropdownMenuItem></DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mb-2">{op.account?.name || t('No Account')}</div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs font-bold">{op.amount ? formatCurrency(parseFloat(op.amount)) : t('No amount')}</div>
                                                                    {op.assigned_users && op.assigned_users.length > 0 && <div className="flex -space-x-2">{op.assigned_users.map((u, i) => (<div key={i} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] uppercase font-bold ring-2 ring-white" title={u.name}>{getInitials(u.name)}</div>))}</div>}
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((op) => (
                        <Card key={op.id} className="bg-white dark:bg-gray-900 border-l-4" style={{ borderLeftColor: op.opportunity_stage?.color }}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-lg font-bold">
                                        {getInitials(op.name)}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleAction('view', op)}><Eye className="h-4 w-4 mr-2" />{t('View')}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', op)}><Edit className="h-4 w-4 mr-2" />{t('Edit')}</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction('delete', op)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />{t('Delete')}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <h3 className="text-lg font-bold mb-2 truncate">{op.name}</h3>
                                <div className="text-sm text-muted-foreground mb-4">{op.account?.name || t('No Account')}</div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{t('Amount')}:</span><span className="font-bold">{op.amount ? formatCurrency(parseFloat(op.amount)) : '-'}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{t('Close Date')}:</span><span>{formatDateTime(op.close_date, false)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{t('Stage')}:</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: op.opportunity_stage?.color }}></div>{op.opportunity_stage?.name}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => handleAction('edit', op)}><Edit className="h-4 w-4 mr-1" />{t('Edit')}</Button>
                                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => handleAction('view', op)}><Eye className="h-4 w-4 mr-1" />{t('View')}</Button>
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
                        { name: 'name', label: t('Opportunity Name'), type: 'text', required: true },
                        { name: 'amount', label: t('Amount'), type: 'number', step: '0.01' },
                        { name: 'close_date', label: t('Close Date'), type: 'date' },
                        { name: 'account_id', label: t('Account'), type: 'select', options: accounts.map(a => ({ value: a.id, label: a.name })), required: true },
                        { name: 'opportunity_stage_id', label: t('Stage'), type: 'select', options: opportunityStages.map(s => ({ value: s.id, label: s.name })), required: true },
                        { name: 'opportunity_source_id', label: t('Source'), type: 'select', options: opportunitySources.map(s => ({ value: s.id, label: s.name })) },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })) },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'status', label: t('Status'), type: 'select', options: [{ value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }], defaultValue: 'active' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Opportunity') : formMode === 'edit' ? t('Edit Opportunity') : t('View Opportunity')}
                mode={formMode}
            />

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={async () => { await axios.delete(`/api/opportunities/${currentItem.id}`); toast.success(t('Deleted')); setIsDeleteModalOpen(false); fetchData(); }} itemName={currentItem?.name || ''} entityName={t('opportunity')} />
        </PageTemplate>
    );
}
