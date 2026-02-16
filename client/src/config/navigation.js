import {
    LayoutGrid,
    Briefcase,
    Image,
    CreditCard,
    Settings,
    DollarSign,
    Gift,
    Palette,
    Mail,
    TrendingUp,
    Users,
    Package,
    ShoppingBag,
    FileText,
    Calendar,
    CalendarDays,
    Phone,
    Ticket,
    Megaphone,
    Folder
} from 'lucide-react';

export const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutGrid,
    },
    {
        title: 'Companies',
        href: '/companies',
        icon: Briefcase,
    },
    {
        title: 'Media Library',
        href: '/media-library',
        icon: Image,
    },
    {
        title: 'Plans',
        icon: CreditCard,
        children: [
            {
                title: 'Plan',
                href: '/plans',
            },
            {
                title: 'Plan Requests',
                href: '/plan-requests',
            },
            {
                title: 'Plan Orders',
                href: '/plan-orders',
            },
        ],
    },
    {
        title: 'Coupons',
        href: '/coupons',
        icon: Settings,
    },
    {
        title: 'Currencies',
        href: '/currencies',
        icon: DollarSign,
    },
    {
        title: 'Referral Program',
        href: '/referral',
        icon: Gift,
    },
    {
        title: 'Landing Page',
        icon: Palette,
        children: [
            {
                title: 'Landing Page',
                href: '/landing-page',
            },
            {
                title: 'Custom Pages',
                href: '/custom-pages',
            },
            {
                title: 'Contact Messages',
                href: '/contact-messages',
            },
            {
                title: 'Newsletters',
                href: '/newsletters',
            },
        ],
    },
    {
        title: 'Email Templates',
        href: '/email-templates',
        icon: Mail,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export const companyNavItems = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutGrid,
    },
    {
        title: 'Staff',
        icon: Users,
        children: [
            { title: 'Users', href: '/users' },
            { title: 'Roles', href: '/roles' }
        ]
    },
    {
        title: 'Lead Management',
        icon: Users,
        children: [
            { title: 'Lead Statuses', href: '/lead-statuses' },
            { title: 'Lead Sources', href: '/lead-sources' },
            { title: 'Leads', href: '/leads' }
        ]
    },
    {
        title: 'Opportunity Management',
        icon: Briefcase,
        children: [
            { title: 'Opportunity Stages', href: '/opportunity-stages' },
            { title: 'Opportunity Sources', href: '/opportunity-sources' },
            { title: 'Opportunities', href: '/opportunities' }
        ]
    },
    {
        title: 'Account Management',
        icon: Briefcase,
        children: [
            { title: 'Account Types', href: '/account-types' },
            { title: 'Account Industries', href: '/account-industries' },
            { title: 'Accounts', href: '/accounts' }
        ]
    },
    {
        title: 'Contacts',
        href: '/contacts',
        icon: Users,
    },
    {
        title: 'Product Setup',
        icon: Package,
        children: [
            { title: 'Taxes', href: '/taxes' },
            { title: 'Brands', href: '/brands' },
            { title: 'Categories', href: '/categories' }
        ]
    },
    {
        title: 'Products',
        href: '/products',
        icon: ShoppingBag,
    },
    {
        title: 'Quotes',
        href: '/quotes',
        icon: FileText,
    },
    {
        title: 'Sales Orders',
        href: '/sales-orders',
        icon: ShoppingBag,
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: FileText,
    },
    {
        title: 'Purchase Orders',
        href: '/purchase-orders',
        icon: ShoppingBag,
    },
    {
        title: 'Delivery Orders',
        href: '/delivery-orders',
        icon: Ticket,
    },
    {
        title: 'Return Orders',
        href: '/return-orders',
        icon: FileText,
    },
    {
        title: 'Receipt Orders',
        href: '/receipt-orders',
        icon: FileText,
    },
    {
        title: 'Document Management',
        icon: Folder,
        children: [
            { title: 'Folders', href: '/document-folders' },
            { title: 'Types', href: '/document-types' },
            { title: 'Documents', href: '/documents' }
        ]
    },
    {
        title: 'Campaign Management',
        icon: Megaphone,
        children: [
            { title: 'Campaign Types', href: '/campaign-types' },
            { title: 'Target Lists', href: '/target-lists' },
            { title: 'Campaigns', href: '/campaigns' }
        ]
    },
    {
        title: 'Project Management',
        icon: Briefcase,
        children: [
            { title: 'Task Statuses', href: '/task-statuses' },
            { title: 'Project Tasks', href: '/project-tasks' },
            { title: 'Projects', href: '/projects' }
        ]
    },
    {
        title: 'Calendar',
        href: '/calendar',
        icon: Calendar,
    },
    {
        title: 'Cases',
        href: '/cases',
        icon: FileText,
    },
    {
        title: 'Meetings',
        href: '/meetings',
        icon: CalendarDays,
    },
    {
        title: 'Calls',
        href: '/calls',
        icon: Phone,
    },
    {
        title: 'Reports',
        icon: TrendingUp,
        children: [
            { title: 'Lead Reports', href: '/reports/leads' },
            { title: 'Sales Reports', href: '/reports/sales' },
            { title: 'Product Reports', href: '/reports/product' },
            { title: 'Contact Reports', href: '/reports/contacts' },
            { title: 'Project Reports', href: '/reports/projects' }
        ]
    },
    {
        title: 'Shipping Provider Types',
        href: '/shipping-provider-types',
        icon: Ticket,
    },
    {
        title: 'Plans',
        icon: CreditCard,
        children: [
            { title: 'Plans', href: '/plans' },
            { title: 'Plan Requests', href: '/plan-requests' },
            { title: 'Plan Orders', href: '/plan-orders' }
        ]
    },
    {
        title: 'Referral Program',
        href: '/referral',
        icon: Gift,
    },
    {
        title: 'Media Library',
        href: '/media-library',
        icon: Image,
    },
    {
        title: 'Notification Templates',
        href: '/notification-templates',
        icon: Mail,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];
