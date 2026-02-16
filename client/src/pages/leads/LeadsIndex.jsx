import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Building2, Users, Download, Upload, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { ImportModal } from '@/components/ImportModal';
import { ConvertLeadModal } from '@/components/ConvertLeadModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { useInitials } from '@/hooks/use-initials';
import leadsAPI from '@/api/leads';
import configAPI from '@/api/config';
import usersAPI from '@/api/users';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function LeadsIndex() {
    const { t } = useTranslation();
    const getInitials = useInitials();

    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeadStatus, setSelectedLeadStatus] = useState('all');
    const [selectedLeadSource, setSelectedLeadSource] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedConverted, setSelectedConverted] = useState('all');
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [activeView, setActiveView] = useState('kanban');

    // Dropdown Data
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [leadSources, setLeadSources] = useState([]);
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
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [convertType, setConvertType] = useState('account');
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [isLoadingKanban, setIsLoadingKanban] = useState(false);
    const [kanbanData, setKanbanData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Dependencies
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [statusesRes, sourcesRes, usersRes] = await Promise.all([
                    configAPI.getLeadStatuses().catch(() => ({ data: [] })),
                    configAPI.getLeadSources().catch(() => ({ data: [] })),
                    usersAPI.getUsers({ limit: 100 }).catch(() => ({ data: [] }))
                ]);

                console.log('Lead Statuses Response:', statusesRes);
                console.log('Lead Sources Response:', sourcesRes);
                console.log('Users Response:', usersRes);

                // Transform data to add consistent 'id' field for dropdowns
                const statuses = (statusesRes.data || []).map(s => ({
                    ...s,
                    id: s.leadStatusId || s.id
                }));

                const sources = (sourcesRes.data || []).map(s => ({
                    ...s,
                    id: s.leadSourceId || s.id
                }));

                const userList = (usersRes.data || []).map(u => ({
                    ...u,
                    id: u.userId || u.id
                }));

                console.log('Transformed Statuses:', statuses);
                console.log('Transformed Sources:', sources);
                console.log('Transformed Users:', userList);

                setLeadStatuses(statuses);
                setLeadSources(sources);
                setUsers(userList);
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
                limit: perPage,
                search: searchTerm,
                status: selectedLeadStatus !== 'all' ? selectedLeadStatus : undefined,
                source: selectedLeadSource !== 'all' ? selectedLeadSource : undefined
            };
            const response = await leadsAPI.getLeads(params);
            const items = response.data || [];

            // Transform data - backend returns assignees array and different field names
            const transformedItems = items.map(item => ({
                ...item,
                id: item.leadId,
                company: item.companyName || item.company, // Map companyName to company
                assigned_users: item.assignees || [],
                // Ensure lead_status is properly structured for display
                lead_status: item.leadStatus ? {
                    name: item.leadStatus.name,
                    color: item.leadStatus.color
                } : (item.lead_status || null)
            }));

            setData(Array.isArray(transformedItems) ? transformedItems : []);
            setTotalItems(response.pagination?.total || 0);
            setTotalPages(response.pagination?.totalPages || 1);
            setFromItem((response.pagination?.page - 1) * response.pagination?.limit + 1 || 0);
            setToItem(Math.min(response.pagination?.page * response.pagination?.limit, response.pagination?.total) || 0);

            // Structure Kanban Data
            if (leadStatuses.length > 0) {
                const structuredData = {};
                leadStatuses.forEach(status => {
                    structuredData[status.leadStatusId] = {
                        status: status,
                        items: transformedItems.filter(lead => lead.leadStatusId === status.leadStatusId)
                    };
                });
                setKanbanData(structuredData);
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
            setData([]);
        } finally {
            setLoading(false);
            setIsLoadingKanban(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, selectedLeadStatus, selectedLeadSource, selectedStatus, selectedConverted, selectedAssignee, searchTerm, leadStatuses]);

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
            case 'convert-to-account':
                setConvertType('account');
                setIsConvertModalOpen(true);
                break;
            case 'convert-to-contact':
                setConvertType('contact');
                setIsConvertModalOpen(true);
                break;
        }
    };

    const handleToggleStatus = async (item) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const newStatus = item.status === 'active' ? 'inactive' : 'active';
            toast.loading(t('Updating status...'));
            await leadsAPI.updateLead(item.id, { status: newStatus });
            toast.success(t('Status updated successfully'));
            fetchData();
        } catch (error) {
            toast.error(t('Status update failed'));
        } finally {
            setIsSubmitting(false);
            toast.dismiss();
        }
    };

    const handleFormSubmit = async (formData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            toast.loading(t('Saving...'));
            // Map form data to backend format
            const apiData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.company,
                leadStatusId: formData.lead_status_id,
                leadSourceId: formData.lead_source_id,
                assignees: formData.assigned_to || [],
                notes: formData.notes
            };

            if (formMode === 'create') {
                await leadsAPI.createLead(apiData);
                toast.success(t('Lead created successfully'));
            } else {
                await leadsAPI.updateLead(currentItem.id, apiData);
                toast.success(t('Lead updated successfully'));
            }
            setIsFormModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('Save failed'));
        } finally {
            setIsSubmitting(false);
            toast.dismiss();
        }
    };

    const handleConvertConfirm = async (lead, type, data) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            toast.loading(t(`Converting to ${type}...`));
            if (type === 'account') {
                await leadsAPI.convertToAccount(lead.id, data);
            } else {
                await leadsAPI.convertToContact(lead.id, data);
            }
            toast.success(t(`Converted to ${type} successfully`));
            setIsConvertModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('Conversion failed'));
        } finally {
            setIsSubmitting(false);
            toast.dismiss();
        }
    };

    const handleDragStart = (e, leadId) => {
        e.dataTransfer.setData('leadId', leadId);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDrop = async (e, statusId) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) {
            try {
                toast.loading(t('Updating status...'));
                await leadsAPI.updateLead(leadId, { leadStatusId: statusId });
                toast.success(t('Status updated'));
                fetchData();
            } catch (error) {
                toast.error(t('Failed to update status'));
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-medium">
                        {getInitials(row.name)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{row.email || t('No email')}</div>
                    </div>
                </div>
            )
        },
        { key: 'company', label: t('Company'), render: (v) => v || t('-') },
        { key: 'value', label: t('Value'), sortable: true, render: (v) => v ? formatCurrency(parseFloat(v)) : '-' },
        {
            key: 'lead_status',
            label: t('Progress'),
            render: (v) => v ? (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }}></div>
                    <span>{v.name}</span>
                </div>
            ) : '-'
        },
        {
            key: 'status',
            label: t('Status'),
            render: (v) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${v === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'}`}>
                    {t(v.charAt(0).toUpperCase() + v.slice(1))}
                </span>
            )
        },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
        {
            key: 'is_converted',
            label: t('Converted'),
            render: (v) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${v ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`}>
                    {v ? t('Yes') : t('No')}
                </span>
            )
        },
        { key: 'created_at', label: t('Created At'), sortable: true, render: (v) => formatDateTime(v, false) }
    ];

    return (
        <PageTemplate
            title={t("Leads")}
            url="/leads"
            actions={[
                { label: t('Add Lead'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setCurrentItem(null); setFormMode('create'); setIsFormModalOpen(true); } },
                { label: t('Import'), icon: <Upload className="h-4 w-4 mr-2" />, onClick: () => setIsImportModalOpen(true), variant: 'outline' }
            ]}
            breadcrumbs={[{ title: t('Dashboard'), href: '/' }, { title: t('Lead Management'), href: '#' }, { title: t('Leads') }]}
            noPadding
            className={activeView === 'kanban' ? 'overflow-hidden' : ''}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={(e) => { e.preventDefault(); setCurrentPage(1); fetchData(); }}
                    filters={[
                        { name: 'lead_status_id', label: t('Lead Status'), type: 'select', value: selectedLeadStatus, onChange: setSelectedLeadStatus, options: [{ value: 'all', label: t('All Statuses') }, ...leadStatuses.map(s => ({ value: s.leadStatusId?.toString() || s.id?.toString(), label: s.name }))] },
                        { name: 'lead_source_id', label: t('Lead Source'), type: 'select', value: selectedLeadSource, onChange: setSelectedLeadSource, options: [{ value: 'all', label: t('All Sources') }, ...leadSources.map(s => ({ value: s.leadSourceId?.toString() || s.id?.toString(), label: s.name }))] },
                        { name: 'status', label: t('Status'), type: 'select', value: selectedStatus, onChange: setSelectedStatus, options: [{ value: 'all', label: t('All Status') }, { value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }] },
                        { name: 'is_converted', label: t('Converted'), type: 'select', value: selectedConverted, onChange: setSelectedConverted, options: [{ value: 'all', label: t('All') }, { value: '1', label: t('Converted') }, { value: '0', label: t('Not Converted') }] },
                        { name: 'assigned_to', label: t('Assigned To'), type: 'select', value: selectedAssignee, onChange: setSelectedAssignee, options: [{ value: 'all', label: t('All Users') }, ...users.map(u => ({ value: u.id.toString(), label: u.name }))] }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => searchTerm !== '' || selectedLeadStatus !== 'all' || selectedLeadSource !== 'all' || selectedStatus !== 'all' || selectedConverted !== 'all' || selectedAssignee !== 'all'}
                    onResetFilters={() => { setSearchTerm(''); setSelectedLeadStatus('all'); setSelectedLeadSource('all'); setSelectedStatus('all'); setSelectedConverted('all'); setSelectedAssignee('all'); }}
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
                    <CrudTable columns={columns} actions={[{ label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' }, { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' }, { label: t('Convert to Account'), icon: 'Building2', action: 'convert-to-account', condition: (item) => !item.is_converted, className: 'text-green-500' }, { label: t('Convert to Contact'), icon: 'Users', action: 'convert-to-contact', condition: (item) => !item.is_converted, className: 'text-blue-500' }, { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' }, { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }]} data={data} from={fromItem} onAction={handleAction} />
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
                                {leadStatuses.map((status) => {
                                    const statusLeads = kanbanData?.[status.leadStatusId]?.items || [];
                                    return (
                                        <div key={status.leadStatusId} className="flex-shrink-0 w-[300px]" onDrop={(e) => handleDrop(e, status.leadStatusId)} onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-blue-50'); }} onDragLeave={(e) => e.currentTarget.classList.remove('bg-blue-50')}>
                                            <div className="bg-gray-100 rounded-lg h-full flex flex-col">
                                                <div className="p-3 border-b border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                                                            <h3 className="font-semibold text-sm text-gray-700 uppercase">{status.name}</h3>
                                                        </div>
                                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{statusLeads.length}</span>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full text-xs border-dashed" onClick={() => { setCurrentItem({ lead_status_id: status.leadStatusId }); setFormMode('create'); setIsFormModalOpen(true); }}><Plus className="h-3 w-3 mr-1" />{t('Add Lead')}</Button>
                                                </div>
                                                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                                                    {statusLeads.map((lead) => (
                                                        <Card key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50')} className="hover:shadow-md transition-all border-l-4 cursor-move" style={{ borderLeftColor: status.color }}>
                                                            <div className="p-3">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h4 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleAction('view', lead)}>{lead.name}</h4>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-40"><DropdownMenuItem onClick={() => handleAction('view', lead)}><Eye className="h-4 w-4 mr-2" />{t('View')}</DropdownMenuItem><DropdownMenuItem onClick={() => handleAction('edit', lead)}><Edit className="h-4 w-4 mr-2" />{t('Edit')}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => handleAction('delete', lead)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />{t('Delete')}</DropdownMenuItem></DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mb-2">{lead.company || t('No Company')}</div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs font-bold">{lead.value ? formatCurrency(parseFloat(lead.value)) : t('No value')}</div>
                                                                    {lead.assigned_users && lead.assigned_users.length > 0 && <div className="flex -space-x-2">{lead.assigned_users.map((u, i) => (<div key={i} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] uppercase font-bold ring-2 ring-white" title={u.name}>{getInitials(u.name)}</div>))}</div>}
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
                    {data.map((lead) => (
                        <Card key={lead.id} className="bg-white dark:bg-gray-900 border-l-4" style={{ borderLeftColor: lead.lead_status?.color }}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-lg font-bold">
                                        {getInitials(lead.name)}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleAction('view', lead)}><Eye className="h-4 w-4 mr-2" />{t('View')}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', lead)}><Edit className="h-4 w-4 mr-2" />{t('Edit')}</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction('delete', lead)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />{t('Delete')}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <h3 className="text-lg font-bold mb-2 truncate">{lead.name}</h3>
                                <div className="text-sm text-muted-foreground mb-4">{lead.company || t('No Company')}</div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{t('Value')}:</span><span className="font-bold">{lead.value ? formatCurrency(parseFloat(lead.value)) : '-'}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{t('Status')}:</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: lead.lead_status?.color }}></div>{lead.lead_status?.name}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => handleAction('edit', lead)}><Edit className="h-4 w-4 mr-1" />{t('Edit')}</Button>
                                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => handleAction('view', lead)}><Eye className="h-4 w-4 mr-1" />{t('View')}</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ConvertLeadModal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} onConfirm={handleConvertConfirm} lead={currentItem} type={convertType} />
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} endpoint="/api/leads/import" entityName={t("Lead")} />

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'email', label: t('Email'), type: 'email' },
                        { name: 'phone', label: t('Phone'), type: 'text' },
                        { name: 'company', label: t('Company'), type: 'text' },
                        { name: 'value', label: t('Value'), type: 'number', step: '0.01' },
                        { name: 'lead_status_id', label: `${t('Lead Status')} [${leadStatuses.length} items]`, type: 'select', options: leadStatuses.map(s => ({ value: s.id, label: s.name })), required: true },
                        { name: 'lead_source_id', label: `${t('Source')} [${leadSources.length} items]`, type: 'select', options: leadSources.map(s => ({ value: s.id, label: s.name })) },
                        { name: 'assigned_to', label: `${t('Assign To')} [${users.length} items]`, type: 'multi-select', options: users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })) },
                        { name: 'address', label: t('Address'), type: 'textarea' },
                        { name: 'notes', label: t('Notes'), type: 'textarea' },
                        { name: 'status', label: t('Status'), type: 'select', options: [{ value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }], defaultValue: 'active' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Lead') : formMode === 'edit' ? t('Edit Lead') : t('View Lead')}
                mode={formMode}
            />

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={async () => { await axios.delete(`/api/leads/${currentItem.id}`); toast.success(t('Deleted')); setIsDeleteModalOpen(false); fetchData(); }} itemName={currentItem?.name || ''} entityName={t('lead')} />
        </PageTemplate>
    );
}
