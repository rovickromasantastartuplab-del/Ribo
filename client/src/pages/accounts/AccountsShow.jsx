import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Building, User, Mail, Phone, Globe, MapPin,
    Calendar, EyeOff, Trash2, FileText, UserCheck, Send, Edit,
    Check, X, MessageCircle
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';

// Mock Data
const mockAccount = {
    id: 1,
    name: 'Acme Corp',
    status: 'active',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'https://acme.com',
    account_type: { name: 'Customer' },
    account_industry: { name: 'Technology', color: '#3b82f6' },
    assigned_users: [{ name: 'Admin User' }],
    billing_address: '123 Business Rd, Suite 100',
    billing_city: 'New York',
    billing_state: 'NY',
    billing_postal_code: '10001',
    billing_country: 'USA',
    shipping_address: '123 Business Rd, Suite 100',
    shipping_city: 'New York',
    shipping_state: 'NY',
    shipping_postal_code: '10001',
    shipping_country: 'USA',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-20T14:20:00Z',
    contacts: [
        { id: 1, name: 'Sarah Wilson' },
        { id: 2, name: 'Michael Chen' }
    ],
    quotes: [
        { id: 1, quote_number: 'Q-2024-001' }
    ]
};

const mockStreamItems = [
    {
        id: 1,
        title: 'Account created',
        activity_type: 'created',
        created_at: '2024-01-15T08:00:00Z',
        user: { name: 'Admin User' },
        description: 'Account was registered.'
    }
];

export default function AccountsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [account, setAccount] = useState(mockAccount);
    const [streamItems, setStreamItems] = useState(mockStreamItems);
    const [showStream, setShowStream] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newComment, setNewComment] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${status === 'active'
                ? 'bg-green-50 text-green-700 ring-green-600/20'
                : 'bg-red-50 text-red-700 ring-red-600/10'
                }`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
            </span>
        );
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Accounts'), href: '/accounts' },
        { title: account.name }
    ];

    const handleAddComment = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            const newItem = {
                id: Date.now(),
                title: 'Added a comment',
                activity_type: 'comment',
                created_at: new Date().toISOString(),
                user: { name: 'Admin User' },
                description: newComment
            };
            setStreamItems([newItem, ...streamItems]);
            setNewComment('');
            toast.success(t('Comment added!'));
        }
    };

    return (
        <PageTemplate
            title={account.name}
            breadcrumbs={breadcrumbs}
            actions={[
                {
                    label: t('Back to Accounts'),
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                    variant: 'outline',
                    onClick: () => navigate('/accounts')
                }
            ]}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold dark:text-white">{account.name}</h1>
                            <p className="text-sm text-muted-foreground mt-2">{account.account_type?.name || t('No type specified')}</p>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(account.status)}
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                        <CardTitle className="text-base font-semibold">{t('Account Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Email Address')}</label>
                                        <p className="text-sm font-medium mt-1">{account.email || t('-')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Phone Number')}</label>
                                        <p className="text-sm font-medium mt-1">{account.phone || t('-')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Website')}</label>
                                        {account.website ? (
                                            <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                                                {account.website}
                                            </a>
                                        ) : (
                                            <p className="text-sm font-medium mt-1">{t('-')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Account Type')}</label>
                                    <p className="text-sm font-medium mt-1">{account.account_type?.name || t('-')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Industry')}</label>
                                    <div className="mt-1">
                                        {account.account_industry ? (
                                            <span
                                                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
                                                style={{
                                                    backgroundColor: `${account.account_industry.color}15`,
                                                    color: account.account_industry.color,
                                                    borderColor: `${account.account_industry.color}30`
                                                }}
                                            >
                                                {account.account_industry.name}
                                            </span>
                                        ) : (
                                            <span className="text-sm font-medium">{t('-')}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Assigned To')}</label>
                                    <p className="text-sm font-medium mt-1">{account.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <MapPin className="h-4 w-4 mr-2" />
                                {t('Billing Address')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-2">
                            <p className="text-sm font-medium">{account.billing_address || t('-')}</p>
                            <p className="text-sm font-medium">
                                {[account.billing_city, account.billing_state, account.billing_postal_code].filter(Boolean).join(', ') || t('-')}
                            </p>
                            <p className="text-sm font-medium">{account.billing_country || t('-')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <MapPin className="h-4 w-4 mr-2" />
                                {t('Shipping Address')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-2">
                            <p className="text-sm font-medium">{account.shipping_address || t('-')}</p>
                            <p className="text-sm font-medium">
                                {[account.shipping_city, account.shipping_state, account.shipping_postal_code].filter(Boolean).join(', ') || t('-')}
                            </p>
                            <p className="text-sm font-medium">{account.shipping_country || t('-')}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Related Records */}
                        <Card>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                                <CardTitle className="text-base font-semibold">{t('Related Records')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-wider">{t('Contacts')} ({account.contacts?.length || 0})</h4>
                                        <div className="space-y-3">
                                            {account.contacts?.map((contact) => (
                                                <div key={contact.id} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                                    <span className="text-sm font-bold text-purple-700">{contact.name}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/contacts/${contact.id}`)}>{t('View')}</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-wider">{t('Quotes')} ({account.quotes?.length || 0})</h4>
                                        <div className="space-y-3">
                                            {account.quotes?.map((quote) => (
                                                <div key={quote.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                                    <span className="text-sm font-bold text-blue-700">{quote.quote_number}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/quotes/${quote.id}`)}>{t('View')}</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Activity Stream */}
                        <div className="space-y-6">
                            <Card className="flex flex-col max-h-[600px]">
                                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {t('Activity Stream')}
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setShowStream(!showStream)}>
                                            {showStream ? <X className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                {showStream && (
                                    <>
                                        <div className="p-4 border-b">
                                            <form onSubmit={handleAddComment} className="flex gap-2">
                                                <Input
                                                    placeholder={t('Add a comment...')}
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Button type="submit" size="sm"><Send className="h-4 w-4" /></Button>
                                            </form>
                                        </div>
                                        <CardContent className="flex-1 overflow-y-auto p-4">
                                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-z-10 before:h-full before:w-0.5 before:bg-gray-100">
                                                {streamItems.map((item) => (
                                                    <div key={item.id} className="relative pl-10">
                                                        <span className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-gray-100 ring-4 ring-white shadow-sm">
                                                            {item.activity_type === 'created' && <Building className="h-3.5 w-3.5 text-green-500" />}
                                                            {item.activity_type === 'comment' && <MessageCircle className="h-3.5 w-3.5 text-purple-500" />}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.user.name}</p>
                                                                <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </>
                                )}
                            </Card>

                            <Card>
                                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-4 py-3">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('Record History')}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">{t('Created')}:</span>
                                        <span className="font-bold">{formatDate(account.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">{t('Last Updated')}:</span>
                                        <span className="font-bold">{formatDate(account.updated_at)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
}
