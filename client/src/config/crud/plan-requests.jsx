import { t } from 'i18next';

export const planRequestsConfig = {
    entity: {
        name: 'planRequests',
        endpoint: '/api/plan-requests', // Updated endpoint for new system
        permissions: {
            view: 'view-plan-requests',
            create: 'create-plan-requests',
            edit: 'edit-plan-requests',
            delete: 'delete-plan-requests'
        }
    },
    modalSize: '4xl',
    // description: t('Manage plan upgrade requests from users'), // t not working here directly usually
    description: 'Manage plan upgrade requests from users',
    table: {
        columns: [
            { key: 'user.name', label: 'Name', sortable: true },
            { key: 'user.email', label: 'Email', sortable: true },
            { key: 'plan.name', label: 'Plan Name', sortable: true },
            {
                key: 'duration',
                label: 'Plan Duration',
                render: (value) => value === 'monthly' ? t('Monthly') : t('Yearly')
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
            },
            {
                key: 'created_at',
                label: 'Requested At',
                sortable: true,
                render: (value) => new Date(value).toLocaleDateString()
            }
        ],
        actions: [
            {
                label: 'Approve',
                icon: 'Check',
                action: 'approve',
                className: 'text-green-600',
                condition: (item) => item.status === 'pending',
                requiredPermission: 'approve-plan-requests'
            },
            {
                label: 'Reject',
                icon: 'X',
                action: 'reject',
                className: 'text-red-600',
                condition: (item) => item.status === 'pending',
                requiredPermission: 'reject-plan-requests'
            }
        ]
    },
    search: {
        enabled: true,
        placeholder: 'Search plan requests...',
        fields: ['user.name', 'user.email', 'plan.name']
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
