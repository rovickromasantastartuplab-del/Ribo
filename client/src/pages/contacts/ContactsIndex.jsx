import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Phone, Mail, MapPin, Briefcase, Building, Lock } from 'lucide-react';
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
import axios from 'axios';
import { useInitials } from '@/hooks/use-initials';
import { formatDateTime } from '@/lib/utils';

export default function ContactsIndex() {
    const { t } = useTranslation();
    const getInitials = useInitials();

    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [activeView, setActiveView] = useState('list');

    // Dependencies
    const [accounts, setAccounts] = useState([]);
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

    // Fetch Dependencies
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [accountsRes, usersRes] = await Promise.all([
                    axios.get('/api/accounts?per_page=100').catch(() => ({ data: { data: [] } })),
                    axios.get('/api/users?per_page=100').catch(() => ({ data: { data: [] } }))
                ]);
                setAccounts(accountsRes.data.data || []);
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
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm,
                account_id: selectedAccount !== 'all' ? selectedAccount : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                assigned_to: selectedAssignee !== 'all' ? selectedAssignee : undefined
            };
            const response = await axios.get('/api/contacts', { params });
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
        } catch (error) {
            console.error("Failed to fetch contacts", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, selectedAccount, selectedStatus, selectedAssignee, searchTerm]);

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
            await axios.put(`/api/contacts/${item.id}`, { ...item, status: newStatus });
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
                await axios.post('/api/contacts', formData);
                toast.success(t('Contact created successfully'));
            } else {
                await axios.put(`/api/contacts/${currentItem.id}`, formData);
                toast.success(t('Contact updated successfully'));
            }
            setIsFormModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('Save failed'));
        } finally {
            toast.dismiss();
        }
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
        { key: 'phone', label: t('Phone'), render: (v) => v || '-' },
        { key: 'position', label: t('Position'), render: (v) => v || '-' },
        { key: 'account', label: t('Account'), render: (v) => v?.name || '-' },
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
            title={t("Contacts")}
            url="/contacts"
            actions={[{ label: t('Add Contact'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setCurrentItem(null); setFormMode('create'); setIsFormModalOpen(true); } }]}
            breadcrumbs={[{ title: t('Dashboard'), href: '/' }, { title: t('Contacts') }]}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={(e) => { e.preventDefault(); setCurrentPage(1); fetchData(); }}
                    filters={[
                        { name: 'account_id', label: t('Account'), type: 'select', value: selectedAccount, onChange: setSelectedAccount, options: [{ value: 'all', label: t('All Accounts') }, ...accounts.map(a => ({ value: a.id.toString(), label: a.name }))] },
                        { name: 'status', label: t('Status'), type: 'select', value: selectedStatus, onChange: setSelectedStatus, options: [{ value: 'all', label: t('All Status') }, { value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }] },
                        { name: 'assigned_to', label: t('Assigned To'), type: 'select', value: selectedAssignee, onChange: setSelectedAssignee, options: [{ value: 'all', label: t('All Users') }, ...users.map(u => ({ value: u.id.toString(), label: u.name }))] }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => selectedAccount !== 'all' || selectedStatus !== 'all' || selectedAssignee !== 'all' || searchTerm !== ''}
                    onResetFilters={() => { setSearchTerm(''); setSelectedAccount('all'); setSelectedStatus('all'); setSelectedAssignee('all'); }}
                    onApplyFilters={() => { setCurrentPage(1); fetchData(); }}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={setActiveView}
                />
            </div>

            {activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable columns={columns} actions={[{ label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' }, { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' }, { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' }, { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }]} data={data} from={fromItem} onAction={handleAction} />
                    <Pagination from={fromItem} to={toItem} total={totalItems} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((contact) => (
                        <Card key={contact.id} className="bg-white dark:bg-gray-900 shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                                            {getInitials(contact.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold truncate">{contact.name}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{contact.email || t('No email')}</p>
                                            <div className="flex items-center mt-1">
                                                <div className={`h-2 w-2 rounded-full mr-2 ${contact.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                <span className="text-xs font-medium">{contact.status === 'active' ? t('Active') : t('Inactive')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleAction('view', contact)}><Eye className="h-4 w-4 mr-2" /><span>{t("View")}</span></DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('toggle-status', contact)}><Lock className="h-4 w-4 mr-2" /><span>{contact.status === 'active' ? t("Deactivate") : t("Activate")}</span></DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleAction('edit', contact)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" /><span>{t("Edit")}</span></DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', contact)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" /><span>{t("Delete")}</span></DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4 space-y-2">
                                    <div className="flex items-center text-sm"><Phone className="h-3 w-3 mr-2" />{contact.phone || '-'}</div>
                                    <div className="flex items-center text-sm"><Briefcase className="h-3 w-3 mr-2" />{contact.position || '-'}</div>
                                    {contact.account && <div className="pt-2 border-t border-gray-100 dark:border-gray-800"><span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"><Building className="h-3 w-3 mr-1" />{contact.account.name}</span></div>}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleAction('edit', contact)} className="flex-1 h-9 text-xs"><Edit className="h-4 w-4 mr-1" />{t('Edit')}</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleAction('view', contact)} className="flex-1 h-9 text-xs"><Eye className="h-4 w-4 mr-1" />{t('View')}</Button>
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
                        { name: 'name', label: t('Contact Name'), type: 'text', required: true },
                        { name: 'email', label: t('Email'), type: 'email' },
                        { name: 'phone', label: t('Phone'), type: 'text' },
                        { name: 'position', label: t('Position'), type: 'text' },
                        { name: 'account_id', label: t('Account'), type: 'select', options: accounts.map(a => ({ value: a.id, label: a.name })), required: true },
                        { name: 'address', label: t('Address'), type: 'textarea' },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` })) },
                        { name: 'status', label: t('Status'), type: 'select', options: [{ value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }], defaultValue: 'active' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Contact') : formMode === 'edit' ? t('Edit Contact') : t('View Contact')}
                mode={formMode}
            />

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={async () => { await axios.delete(`/api/contacts/${currentItem.id}`); toast.success(t('Deleted')); setIsDeleteModalOpen(false); fetchData(); }} itemName={currentItem?.name || ''} entityName={t('contact')} />
        </PageTemplate>
    );
}
