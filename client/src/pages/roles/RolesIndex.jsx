import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Plus } from 'lucide-react';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { PermissionBadges } from '@/components/PermissionBadges';
import { RolePermissionCheckboxGroup } from '@/components/RolePermissionCheckboxGroup';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { roleService } from '@/services/roleService';

export default function RolesIndex() {
    const { t } = useTranslation();

    // State
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allPermissions, setAllPermissions] = useState({});

    // Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const rolesData = await roleService.getAll();
            // Backend returns { success: true, data: [...] } or just [...]
            const data = rolesData.data || rolesData;

            // Transform data to add 'id' field for CrudTable compatibility
            const transformedRoles = Array.isArray(data) ? data.map(role => ({
                ...role,
                id: role.roleId // Map roleId to id
            })) : [];

            setRoles(transformedRoles);

            // Fetch permissions for the form
            // Legacy uses /roles/permissions or similar
            const permData = await roleService.getAllPermissions();
            setAllPermissions(permData.data || permData);

        } catch (error) {
            console.error("Failed to fetch roles", error);
            toast.error(t('Failed to load roles'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = (action, item) => {
        setCurrentItem(item);
        switch (action) {
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
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
            if (formMode === 'create') {
                toast.loading(t('Creating role...'));
                await roleService.create(formData);
                toast.success(t('Role created successfully'));
            } else if (formMode === 'edit') {
                toast.loading(t('Updating role...'));

                // Update basic info
                await roleService.update(currentItem.id, {
                    name: formData.name,
                    description: formData.description
                });

                // Then update permissions if changed
                if (formData.permissions) {
                    await roleService.updatePermissions(currentItem.id, formData.permissions);
                }

                toast.success(t('Role updated successfully'));
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
            toast.loading(t('Deleting role...'));
            await roleService.delete(currentItem.id);
            toast.success(t('Role deleted successfully'));
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || t('Delete failed');
            toast.error(msg);
        } finally {
            toast.dismiss();
        }
    };

    const columns = [
        {
            key: 'name',
            label: t('Role Name'),
            render: (value, row) => (
                <div>
                    <div className="font-medium">{row.label || row.name}</div>
                    <div className="text-sm text-muted-foreground">{row.description}</div>
                </div>
            )
        },
        {
            key: 'permissions',
            label: t('Permissions'),
            render: (value) => <PermissionBadges permissions={value || []} />
        },
        {
            key: 'users_count',
            label: t('Users'),
            render: (value) => <span className="text-sm text-muted-foreground">{value || 0} {t('users')}</span>
        }
    ];

    const actions = [
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    const pageActions = [
        {
            label: t('Add Role'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: handleAddNew
        }
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Staff'), href: '/users' }, // Navigate to users usually, or direct?
        { title: t('Roles') }
    ];

    return (
        <PageTemplate
            title={t("Roles")}
            description={t("Manage roles and permissions")}
            url="/roles"
            actions={pageActions}
            breadcrumbs={breadcrumbs}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={actions}
                    data={roles}
                    onAction={handleAction}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        {
                            name: 'permissions',
                            label: t('Permissions'),
                            type: 'custom',
                            colSpan: 12, // Full width
                            render: (field, formData, onChange) => (
                                <div className="mt-4" id="permissions">
                                    <h3 className="text-lg font-medium mb-2">{t("Manage Permissions")}</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {t("Select permissions for this role.")}
                                    </p>
                                    <RolePermissionCheckboxGroup
                                        permissions={allPermissions}
                                        selectedPermissions={formData.permissions || []}
                                        onChange={(selected) => {
                                            onChange('permissions', selected);
                                        }}
                                    />
                                </div>
                            )
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem ? {
                    ...currentItem,
                    permissions: currentItem.permissions ? currentItem.permissions.map(p => p.id.toString()) : []
                } : null}
                title={formMode === 'create' ? t('Add New Role') : t('Edit Role')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.label || currentItem?.name || ''}
                entityName="role"
            />
        </PageTemplate>
    );
}
