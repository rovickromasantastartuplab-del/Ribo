import { t } from 'i18next';

export const planOrdersConfig = {
    entity: {
        name: 'plan-orders',
        endpoint: '/api/plan-orders',
        permissions: {
            view: 'view-plan-orders',
            create: 'create-plan-orders',
            edit: 'edit-plan-orders',
            delete: 'delete-plan-orders'
        }
    },
    modalSize: '4xl',
    description: 'Manage plan orders and subscription requests',
    table: {
        columns: [
            { key: 'order_number', label: 'Order Number', sortable: true },
            {
                key: 'ordered_at',
                label: 'Order Date',
                sortable: true,
                render: (value) => new Date(value).toLocaleDateString()
            },
            {
                key: 'user.name',
                label: 'User Name',
                sortable: false
            },
            {
                key: 'plan.name',
                label: 'Plan Name',
                sortable: false
            },
            {
                key: 'original_price',
                label: 'Original Price',
                render: (value) => `$${value}` // Simplified formatting for now
            },
            {
                key: 'coupon_code',
                label: 'Coupon Code',
                render: (value) => value || '-'
            },
            {
                key: 'discount_amount',
                label: 'Discount',
                render: (value) => value > 0 ? `-$${value}` : '-'
            },
            {
                key: 'final_price',
                label: 'Final Price',
                render: (value) => `$${value}`
            },
            {
                key: 'status',
                label: 'Status',
                render: (value) => {
                    const styles = {
                        approved: 'bg-green-100 text-green-800',
                        rejected: 'bg-red-100 text-red-800',
                        pending: 'bg-yellow-100 text-yellow-800'
                    };
                    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[value] || 'bg-gray-100'}`}>{value}</span>;
                }
            }
        ],
        actions: [
            {
                label: 'Approve',
                icon: 'Check',
                action: 'approve',
                className: 'text-green-600',
                condition: (row) => row.status === 'pending',
                requiredPermission: 'approve-plan-orders'
            },
            {
                label: 'Reject',
                icon: 'X',
                action: 'reject',
                className: 'text-red-600',
                condition: (row) => row.status === 'pending',
                requiredPermission: 'reject-plan-orders'
            }
        ]
    },
    search: {
        enabled: true,
        placeholder: 'Search orders...',
        fields: ['order_number', 'user.name', 'plan.name', 'coupon_code']
    },
    filters: [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
            ]
        }
    ],
    form: {
        fields: []
    }
};
