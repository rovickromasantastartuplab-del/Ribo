import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { IndeterminateCheckbox } from '@/components/ui/indeterminate-checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function RolePermissionCheckboxGroup({
    permissions,
    selectedPermissions,
    onChange
}) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState([]);

    // Use permissions directly as they are already filtered by backend
    // permissions is expected to be an object { ModuleName: [PermissionObj, ...] }
    const filteredPermissions = permissions || {};

    // Get all permission IDs
    const getAllPermissionIds = () => {
        const allIds = [];
        Object.values(filteredPermissions).forEach(group => {
            group.forEach(permission => {
                allIds.push(permission.id.toString());
            });
        });
        return allIds;
    };

    // Get all permission IDs for a specific module
    const getModulePermissionIds = (module) => {
        return filteredPermissions[module]?.map(permission => permission.id.toString()) || [];
    };

    // Initialize selected permissions
    useEffect(() => {
        if (!selectedPermissions || Object.keys(filteredPermissions).length === 0) {
            setSelected([]);
            return;
        }

        try {
            const nameMap = {};

            Object.values(filteredPermissions).forEach(group => {
                group.forEach(permission => {
                    nameMap[permission.name] = permission.id.toString();
                });
            });

            let processedPermissions = [];

            if (Array.isArray(selectedPermissions)) {
                processedPermissions = selectedPermissions.map(p => {
                    if (typeof p === 'object' && p !== null) {
                        if ('id' in p) return p.id.toString();
                        if ('name' in p) return nameMap[p.name] || p.name;
                    }
                    return nameMap[String(p)] || String(p);
                }).filter(Boolean);
            } else if (typeof selectedPermissions === 'object' && selectedPermissions !== null) {
                // Handle case where it might be wrapped
                if ('permissions' in selectedPermissions && Array.isArray(selectedPermissions.permissions)) {
                    processedPermissions = selectedPermissions.permissions.map(p => {
                        if (typeof p === 'object' && p !== null) {
                            if ('id' in p) return p.id.toString();
                            if ('name' in p) return nameMap[p.name] || p.name;
                        }
                        return nameMap[String(p)] || String(p);
                    }).filter(Boolean);
                } else {
                    // Maybe it's a key-value map?
                    // For strict port, align with whatever format enters
                    // Usually it's just an array of IDs or names
                }
            }

            // Ensure unique
            setSelected([...new Set(processedPermissions)]);
        } catch (error) {
            console.error('Error processing permissions:', error);
            setSelected([]);
        }
    }, [selectedPermissions, permissions]); // Added permissions dependency

    const handlePermissionChange = (permissionId, checked) => {
        const newSelected = checked
            ? [...selected, permissionId]
            : selected.filter(id => id !== permissionId);

        setSelected(newSelected);
        updateParent(newSelected);
    };

    const handleModuleChange = (module, checked) => {
        const modulePermissionIds = getModulePermissionIds(module);

        let newSelected;

        if (checked) {
            const permissionsToAdd = modulePermissionIds.filter(id => !selected.includes(id));
            newSelected = [...selected, ...permissionsToAdd];
        } else {
            newSelected = selected.filter(id => !modulePermissionIds.includes(id));
        }

        setSelected(newSelected);
        updateParent(newSelected);
    };

    const handleSelectAll = (checked) => {
        const newSelected = checked ? getAllPermissionIds() : [];
        setSelected(newSelected);
        updateParent(newSelected);
    };

    const updateParent = (newSelected) => {
        // If parent expects names, map back to names. If IDs, send IDs.
        // Legacy code mapped back to names if they existed.

        const idToNameMap = {};

        Object.values(filteredPermissions).forEach(group => {
            group.forEach(permission => {
                idToNameMap[permission.id.toString()] = permission.name;
            });
        });

        // Check if we should return names or IDs based on input type? 
        // Usually backend expects IDs for syncing.
        // Legacy `updateParent` implementation:
        // const permissionNames = newSelected.map(id => idToNameMap[id] || id).filter(name => !!name);
        // onChange(permissionNames);

        // For this new app, let's return IDs as that is safer for API
        onChange(newSelected);
    };

    // Check if all permissions are selected
    const isAllSelected = selected.length === getAllPermissionIds().length && getAllPermissionIds().length > 0;

    // Check if all permissions in a module are selected
    const isModuleSelected = (module) => {
        const modulePermissionIds = getModulePermissionIds(module);
        return modulePermissionIds.every(id => selected.includes(id)) && modulePermissionIds.length > 0;
    };

    // Check if some but not all permissions in a module are selected
    const isModuleIndeterminate = (module) => {
        const modulePermissionIds = getModulePermissionIds(module);
        const selectedCount = modulePermissionIds.filter(id => selected.includes(id)).length;
        return selectedCount > 0 && selectedCount < modulePermissionIds.length;
    };

    const getModuleSelectionCount = (module) => {
        const modulePermissionIds = getModulePermissionIds(module);
        return modulePermissionIds.filter(id => selected.includes(id)).length;
    }

    return (
        <div className="space-y-6">
            {/* Select All Checkbox */}
            <div className="border rounded shadow-sm p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <IndeterminateCheckbox
                            id="select-all-permissions-checkbox"
                            checked={isAllSelected}
                            // indeterminate is not supported on standard checkbox prop for select all in this UI logic usually
                            // but we can check if some are selected
                            indeterminate={selected.length > 0 && !isAllSelected}
                            onCheckedChange={(checked) => handleSelectAll(checked === true)}
                        />
                        <Label htmlFor="select-all-permissions-checkbox" className="font-medium">
                            {t("Select All Permissions")}
                        </Label>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {selected.length} {t("of")} {getAllPermissionIds().length} {t("selected")}
                    </div>
                </div>
            </div>

            {/* Module Permissions */}
            <div className="space-y-6">
                {Object.entries(filteredPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="border rounded shadow-sm dark:border-gray-700">
                        {/* Module Header */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <IndeterminateCheckbox
                                    id={`module-checkbox-${module.replace(/\s+/g, '-').toLowerCase()}`}
                                    checked={isModuleSelected(module)}
                                    indeterminate={isModuleIndeterminate(module)}
                                    onCheckedChange={(checked) => handleModuleChange(module, checked === true)}
                                />
                                <Label htmlFor={`module-checkbox-${module.replace(/\s+/g, '-').toLowerCase()}`} className="font-medium">
                                    {module}
                                </Label>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {getModuleSelectionCount(module)} {t("of")} {modulePermissions.length} {t("selected")}
                            </div>
                        </div>

                        {/* Individual Permissions */}
                        <div className="p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {modulePermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`permission-checkbox-${permission.id.toString().replace(/\s+/g, '-').toLowerCase()}`}
                                            checked={selected.includes(permission.id.toString())}
                                            onCheckedChange={(checked) =>
                                                handlePermissionChange(permission.id.toString(), checked === true)
                                            }
                                        />
                                        <Label htmlFor={`permission-checkbox-${permission.id.toString().replace(/\s+/g, '-').toLowerCase()}`} className="text-sm truncate cursor-pointer">
                                            {permission.label || permission.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
