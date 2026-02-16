import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

export function PermissionBadges({ permissions, maxDisplay = 3 }) {
    const { t } = useTranslation();

    // Handle various formats of permissions (array of strings, objects, etc)
    const perms = Array.isArray(permissions) ? permissions : [];

    if (perms.length === 0) {
        return <span className="text-sm text-muted-foreground">-</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {perms.slice(0, maxDisplay).map((permission, index) => {
                const label = typeof permission === 'object' ? (permission.label || permission.name) : permission;
                return (
                    <Badge key={index} variant="secondary" className="text-xs font-normal">
                        {label}
                    </Badge>
                );
            })}
            {perms.length > maxDisplay && (
                <Badge variant="outline" className="text-xs font-normal">
                    +{perms.length - maxDisplay} {t("more")}
                </Badge>
            )}
        </div>
    );
}
