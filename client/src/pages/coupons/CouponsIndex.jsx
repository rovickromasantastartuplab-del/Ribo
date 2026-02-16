import React, { useState, useEffect } from 'react';
import { PageCrudWrapper } from '@/components/PageCrudWrapper';
import { couponsConfig } from '@/config/crud/coupons';
import { useTranslation } from 'react-i18next';

export default function CouponsIndex() {
    const { t } = useTranslation();
    const [config, setConfig] = useState(couponsConfig);

    // Customize the config with translations and hooks
    useEffect(() => {
        setConfig(prev => ({
            ...prev,
            table: {
                ...prev.table,
                columns: prev.table.columns.map(col => ({
                    ...col,
                    label: col.label // In real app, t(col.label)
                }))
            }
        }));
    }, [t]);

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Coupons') }
    ];

    return (
        <PageCrudWrapper
            config={config}
            url="/coupons"
            breadcrumbs={breadcrumbs}
        />
    );
}
