export const hasRole = (role, userRoles = []) =>
    userRoles.includes(role);

export const hasPermission = (userPermissions, permission) => {
    if (!userPermissions) return false;
    return userPermissions.includes(permission);
};
