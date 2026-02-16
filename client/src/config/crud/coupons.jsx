import React from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/custom-toast';
import { t } from 'i18next';

export const couponsConfig = {
    entity: {
        name: 'coupons',
        endpoint: '/api/coupons',
        permissions: {
            view: 'view-coupons',
            create: 'create-coupons',
            edit: 'create-coupons',
            delete: 'delete-coupons'
        }
    },
    modalSize: '4xl',
    description: 'Manage discount coupons and promotional codes',
    table: {
        columns: [
            { key: 'name', label: 'Name', sortable: true },
            {
                key: 'type',
                label: 'Type',
                sortable: true,
                render: (value) => {
                    return value === 'percentage' ? 'Percentage' : 'Flat Amount';
                }
            },
            {
                key: 'minimum_spend',
                label: 'Min Spend',
                render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-'
            },
            {
                key: 'maximum_spend',
                label: 'Max Spend',
                render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-'
            },
            {
                key: 'discount_amount',
                label: 'Discount',
                render: (value, row) => {
                    const amount = parseFloat(value);
                    return row.type === 'percentage'
                        ? `${amount}%`
                        : `$${amount.toFixed(2)}`;
                }
            },
            { key: 'use_limit_per_coupon', label: 'Coupon Limit', render: (value) => value || 'Unlimited' },
            { key: 'use_limit_per_user', label: 'User Limit', render: (value) => value || 'Unlimited' },
            {
                key: 'expiry_date',
                label: 'Expiry Date',
                sortable: true,
                render: (value) => value ? new Date(value).toLocaleDateString() : '-'
            },
            { key: 'code', label: 'Code', sortable: true },
            {
                key: 'status',
                label: 'Status',
                type: 'custom',
                render: (value, row) => {
                    // Status switch component
                    const StatusSwitch = () => {
                        // Mock toggle
                        const [checked, setChecked] = React.useState(!!value);
                        return (
                            <Switch checked={checked} onCheckedChange={(c) => {
                                setChecked(c);
                                toast.success("Status updated (Mock)");
                            }} />
                        )
                    }
                    return <StatusSwitch />;
                }
            }
        ],
        actions: [
            {
                label: 'View Details',
                icon: 'Eye',
                action: 'view-details',
                className: 'text-blue-500'
            },
            {
                label: 'Edit',
                icon: 'Edit',
                action: 'edit',
                className: 'text-amber-500'
            },
            {
                label: 'Delete',
                icon: 'Trash2',
                action: 'delete',
                className: 'text-red-500'
            }
        ]
    },
    search: {
        enabled: true,
        placeholder: 'Search coupons...',
        fields: ['name', 'code']
    },
    filters: [
        {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'percentage', label: 'Percentage' },
                { value: 'flat', label: 'Flat Amount' }
            ]
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'all', label: 'All Status' },
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' }
            ]
        }
    ],
    form: {
        fields: [
            {
                name: 'name',
                label: 'Coupon Name',
                type: 'text',
                required: true,
                colSpan: 12,
                placeholder: 'Enter coupon name'
            },
            {
                name: 'type',
                label: 'Discount Type',
                type: 'select',
                required: true,
                colSpan: 6,
                options: [
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'flat', label: 'Fixed Amount ($)' }
                ]
            },
            {
                name: 'discount_amount',
                label: 'Discount Value',
                type: 'number',
                required: true,
                colSpan: 6,
                min: 0,
                max: 99,
                step: 0.01,
                placeholder: 'Enter value'
            },
            {
                name: 'code_type',
                label: 'Code Generation',
                type: 'radio',
                required: true,
                colSpan: 12,
                options: [
                    { value: 'manual', label: 'Manual Entry' },
                    { value: 'auto', label: 'Auto Generate' }
                ],
                defaultValue: 'manual'
            },
            {
                name: 'code',
                label: 'Coupon Code',
                type: 'custom',
                colSpan: 12,
                render: (field, formData, onChange) => {
                    const generateCode = () => {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                        let result = '';
                        for (let i = 0; i < 10; i++) {
                            result += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        onChange('code', result);
                    };

                    const isAuto = formData.code_type === 'auto';

                    return (
                        <div className="space-y-2">
                            {isAuto ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.code || ''}
                                        onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                                        placeholder="Click generate to create code"
                                        className="flex-1 px-3 py-2 border rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Generate
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={formData.code || ''}
                                    onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            )}
                        </div>
                    );
                }
            },
            {
                name: 'minimum_spend',
                label: 'Minimum Spend ($)',
                type: 'number',
                colSpan: 6,
                min: 0,
                step: 0.01,
                placeholder: 'Optional'
            },
            {
                name: 'maximum_spend',
                label: 'Maximum Spend ($)',
                type: 'number',
                colSpan: 6,
                min: 0,
                step: 0.01,
                placeholder: 'Optional'
            },
            {
                name: 'use_limit_per_coupon',
                label: 'Total Usage Limit',
                type: 'number',
                colSpan: 6,
                min: 1,
                placeholder: 'Leave empty for unlimited'
            },
            {
                name: 'use_limit_per_user',
                label: 'Usage Limit Per User',
                type: 'number',
                colSpan: 6,
                min: 1,
                placeholder: 'Leave empty for unlimited'
            },
            {
                name: 'expiry_date',
                label: 'Expiry Date',
                type: 'date',
                colSpan: 6
            },
            {
                name: 'status',
                label: 'Status',
                type: 'switch',
                colSpan: 6,
                defaultValue: true,
                placeholder: 'Enable or disable this coupon'
            }
        ]
    }
};
