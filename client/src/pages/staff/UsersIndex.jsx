import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, KeyRound, Lock, Unlock, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';

// Utility for initials
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function UsersIndex() {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();

    // State
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [fromItem, setFromItem] = useState(0);
    const [toItem, setToItem] = useState(0);
    const [paginationLinks, setPaginationLinks] = useState([]);

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm,
                role: selectedRole !== 'all' ? selectedRole : undefined
            };

            const data = await userService.getAll(params);

            setUsers(Array.isArray(data.data) ? data.data : []);
            setTotalItems(data.total);
            setTotalPages(data.last_page);
            setFromItem(data.from);
            setToItem(data.to);
            setPaginationLinks(data.links);

            // Also fetch roles for the filter
            if (roles.length === 0) {
                const rolesData = await roleService.getAll();
                const items = rolesData.data || rolesData;
                setRoles(Array.isArray(items) ? items : []);
            }

        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error(t('Failed to load users'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, selectedRole, searchTerm]); // Add dependencies

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchData();
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' || selectedRole !== 'all';
    };

    const activeFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (selectedRole !== 'all') count++;
        return count;
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedRole('all');
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchData();
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
            case 'reset-password':
                setIsResetPasswordModalOpen(true);
                break;
            case 'toggle-status':
                handleToggleStatus(item);
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

    const handleFormSubmit = async (formData) => {
        try {
            // Transform roles to single ID if array
            const payload = { ...formData };
            if (Array.isArray(payload.roles)) {
                payload.role_id = payload.roles;
            }

            if (formMode === 'create') {
                toast.loading(t('Sending invitation...'));
                await userService.create(payload);
                toast.success(t('Invitation sent successfully'));
            } else if (formMode === 'edit') {
                toast.loading(t('Updating user...'));
                await userService.update(currentItem.id, payload);
                toast.success(t('User updated successfully'));
            }

            setIsFormModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Form submit error", error);
            const msg = error.response?.data?.message || t('Operation failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            toast.loading(t('Deleting user...'));
            await userService.delete(currentItem.id);
            toast.success(t('User deleted successfully'));
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || t('Delete failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const handleResetPasswordConfirm = async (data) => {
        try {
            toast.loading(t('Resetting password...'));
            await userService.resetPassword(currentItem.id, data);
            toast.success(t('Password reset successfully'));
            setIsResetPasswordModalOpen(false);
        } catch (error) {
            const msg = error.response?.data?.message || t('Reset failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} user...`);
            await userService.toggleStatus(user.id, newStatus);
            toast.success(t('Status updated successfully'));
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || t('Status update failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        {/* <AvatarImage src={row.avatar} /> */}
                        <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-sm text-muted-foreground">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'roles',
            label: t('Roles'),
            render: (value) => {
                if (!value || !value.length) return <span className="text-muted-foreground">No roles</span>;
                return value.map((role) => (
                    <span key={role.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-1">
                        {role.label || role.name}
                    </span>
                ));
            }
        },
        {
            key: 'created_at',
            label: t('Joined'),
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Reset Password'), icon: 'KeyRound', action: 'reset-password', className: 'text-blue-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    const pageActions = [
        {
            label: t('Add User'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: handleAddNew
        }
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Staff'), href: '/users' },
        { title: t('Users') }
    ];

    return (
        <PageTemplate
            title={t("Users")}
            description={t("Manage your team members and their permissions")}
            url="/users"
            actions={pageActions}
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
                            name: 'role',
                            label: t('Role'),
                            type: 'select',
                            value: selectedRole,
                            onChange: setSelectedRole,
                            options: [
                                { value: 'all', label: t('All Roles') },
                                ...(Array.isArray(roles) ? roles : []).map(role => ({
                                    value: role.id.toString(),
                                    label: role.label || role.name
                                }))
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    onApplyFilters={handleApplyFilters}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={setActiveView}
                />
            </div>

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">{t("Loading users...")}</div>
            ) : activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable
                        columns={columns}
                        actions={actions}
                        data={users}
                        onAction={handleAction}
                    />
                    <Pagination
                        from={fromItem}
                        to={toItem}
                        total={totalItems}
                        onPageChange={(page) => setCurrentPage(page)}
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(Array.isArray(users) ? users : []).map((user) => (
                            <Card key={user.id} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarFallback className="text-lg font-bold">{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{user.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{user.email}</p>
                                                <div className="flex items-center">
                                                    <div className={`h-2 w-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {user.status === 'active' ? t('Active') : t('Inactive')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <div className="h-4 w-4 rotate-90">...</div>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleAction('view', user)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    {t('View')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction('edit', user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    {t('Edit')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction('reset-password', user)}>
                                                    <KeyRound className="mr-2 h-4 w-4" />
                                                    {t('Reset Password')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction('toggle-status', user)}>
                                                    {user.status === 'active' ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                                                    {user.status === 'active' ? t('Disable') : t('Enable')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleAction('delete', user)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t('Delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <span key={role.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-700/30">
                                                        {role.label || role.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs">{t("No role")}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-4">
                                        {t("Joined:")} {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <Pagination
                        from={fromItem}
                        to={toItem}
                        total={totalItems}
                        onPageChange={(page) => setCurrentPage(page)}
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            )}

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'email', label: t('Email'), type: 'email', required: true },
                        {
                            name: 'password',
                            label: t('Password'),
                            type: 'password',
                            required: true,
                            conditional: (mode) => mode === 'create'
                        },
                        {
                            name: 'password_confirmation',
                            label: t('Confirm Password'),
                            type: 'password',
                            required: true,
                            conditional: (mode) => mode === 'create'
                        },
                        {
                            name: 'roles',
                            label: t('Role'),
                            type: 'select',
                            options: (Array.isArray(roles) ? roles : []).map(role => ({
                                value: role.id,
                                label: role.label || role.name
                            })),
                            required: true
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem ? {
                    ...currentItem,
                    roles: currentItem.roles && currentItem.roles.length > 0 ? currentItem.roles[0].id : ''
                } : null}
                title={formMode === 'create' ? t('Add New User') : t('Edit User')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName="user"
            />

            <CrudFormModal
                isOpen={isResetPasswordModalOpen}
                onClose={() => setIsResetPasswordModalOpen(false)}
                onSubmit={handleResetPasswordConfirm}
                formConfig={{
                    fields: [
                        { name: 'password', label: t('New Password'), type: 'password', required: true },
                        { name: 'password_confirmation', label: t('Confirm Password'), type: 'password', required: true }
                    ],
                    modalSize: 'sm'
                }}
                initialData={{}}
                title={`Reset Password for ${currentItem?.name || 'User'}`}
                mode="edit"
            />
        </PageTemplate>
    );
}
