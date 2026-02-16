import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Target, DollarSign, Calendar, User, Building,
    Package, FileText, EyeOff, Trash2, Send, Edit, Check, X,
    MessageCircle
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';

// Mock Data
const mockOpportunity = {
    id: 1,
    name: 'Enterprise License - Acme Corp',
    description: '100 seat license for Acme Corp Marketing team.',
    amount: 25000,
    status: 'active',
    close_date: '2024-06-30',
    created_at: '2024-01-22T09:00:00Z',
    updated_at: '2024-01-23T11:45:00Z',
    notes: 'Decision maker is Sarah Wilson. Procurement process takes 30 days.',
    opportunity_stage: { name: 'Negotiation', color: '#8b5cf6' },
    opportunity_source: { name: 'Existing Customer' },
    assigned_users: [{ name: 'Admin User' }],
    account: { id: 1, name: 'Acme Corp' },
    contact: { id: 1, name: 'Sarah Wilson' },
    products: [
        {
            name: 'Enterprise License',
            pivot: { quantity: 1, unit_price: 20000, total_price: 20000 },
            tax: { name: 'VAT', rate: 20 }
        },
        {
            name: 'Onboarding Service',
            pivot: { quantity: 1, unit_price: 5000, total_price: 5000 },
            tax: { name: 'VAT', rate: 20 }
        }
    ]
};

const mockStreamItems = [
    {
        id: 1,
        title: 'Opportunity created',
        activity_type: 'created',
        created_at: '2024-01-22T09:00:00Z',
        user: { name: 'Admin User' },
        description: 'Opportunity created for Acme Corp.'
    },
    {
        id: 2,
        title: 'Stage moved',
        activity_type: 'updated',
        created_at: '2024-01-23T11:45:00Z',
        user: { name: 'Admin User' },
        description: 'Moved from <b>Discovery</b> to <b>Negotiation</b>'
    }
];

export default function OpportunitiesShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [opportunity, setOpportunity] = useState(mockOpportunity);
    const [streamItems, setStreamItems] = useState(mockStreamItems);
    const [showStream, setShowStream] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [newComment, setNewComment] = useState('');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('-');
        return new Date(dateString).toLocaleDateString();
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalTax = 0;
        opportunity.products.forEach(p => {
            subtotal += p.pivot.total_price;
            if (p.tax) totalTax += (p.pivot.total_price * p.tax.rate) / 100;
        });
        return { subtotal, totalTax, grandTotal: subtotal + totalTax };
    };

    const { subtotal, totalTax, grandTotal } = calculateTotals();

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Opportunities'), href: '/opportunities' },
        { title: opportunity.name }
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
            title={opportunity.name}
            breadcrumbs={breadcrumbs}
            actions={[
                {
                    label: t('Back to Opportunities'),
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                    variant: 'outline',
                    onClick: () => navigate('/opportunities')
                }
            ]}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{opportunity.name}</h1>
                            <p className="text-sm text-gray-500 mt-2">{opportunity.description || t('No description provided')}</p>
                        </div>
                        <div className="text-right ml-6">
                            <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${opportunity.status === 'active'
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : 'bg-red-50 text-red-700 ring-red-600/10'
                                }`}>
                                {opportunity.status?.charAt(0).toUpperCase() + opportunity.status?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-green-600 leading-none">{formatCurrency(opportunity.amount)}</h3>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Products')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-blue-600 leading-none">{opportunity.products?.length || 0}</h3>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Close Date')}</p>
                                    <h3 className="mt-2 text-lg font-bold text-orange-600 leading-tight">{formatDate(opportunity.close_date)}</h3>
                                </div>
                                <div className="rounded-full bg-orange-100 p-3">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Stage')}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opportunity.opportunity_stage.color }}></div>
                                        <span className="text-lg font-bold text-purple-600">{opportunity.opportunity_stage.name}</span>
                                    </div>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Opportunity Information */}
                        <Card>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                                <CardTitle className="text-base font-semibold">{t('Opportunity Information')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Amount')}</label>
                                            <p className="text-sm font-medium mt-1">{formatCurrency(opportunity.amount)}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Source')}</label>
                                            <p className="text-sm font-medium mt-1">{opportunity.opportunity_source?.name || t('-')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Assigned To')}</label>
                                            <p className="text-sm font-medium mt-1">{opportunity.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Close Date')}</label>
                                            <p className="text-sm font-medium mt-1">{formatDate(opportunity.close_date)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Records */}
                        <Card>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                                <CardTitle className="flex items-center text-base font-semibold">
                                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {t('Related Records')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {opportunity.account && (
                                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <Building className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Account')}</p>
                                                <Link to={`/accounts/${opportunity.account.id}`} className="text-sm font-bold text-green-700 hover:underline">{opportunity.account.name}</Link>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/accounts/${opportunity.account.id}`)}>{t('View')}</Button>
                                    </div>
                                )}
                                {opportunity.contact && (
                                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                <User className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Contact')}</p>
                                                <Link to={`/contacts/${opportunity.contact.id}`} className="text-sm font-bold text-purple-700 hover:underline">{opportunity.contact.name}</Link>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/contacts/${opportunity.contact.id}`)}>{t('View')}</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Products Table */}
                        <Card>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                                <CardTitle className="flex items-center text-base font-semibold">
                                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {t('Products')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-100/50 dark:bg-gray-800/50">
                                            <TableHead className="font-bold">{t('Product')}</TableHead>
                                            <TableHead className="text-right font-bold">{t('Qty')}</TableHead>
                                            <TableHead className="text-right font-bold">{t('Price')}</TableHead>
                                            <TableHead className="text-right font-bold">{t('Tax')}</TableHead>
                                            <TableHead className="text-right font-bold">{t('Total')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {opportunity.products.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="text-right">{product.pivot.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(product.pivot.unit_price)}</TableCell>
                                                <TableCell className="text-right">{product.tax ? `${product.tax.rate}%` : '-'}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600">{formatCurrency(product.pivot.total_price)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                                            <TableCell colSpan={4} className="text-right font-bold">{t('Subtotal')}</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(subtotal)}</TableCell>
                                        </TableRow>
                                        <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                                            <TableCell colSpan={4} className="text-right font-bold border-t-2">{t('Grand Total')}</TableCell>
                                            <TableCell className="text-right font-bold text-lg text-green-600 border-t-2">{formatCurrency(grandTotal)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Activity Stream */}
                        <Card className="flex flex-col max-h-[800px]">
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
                                                        {item.activity_type === 'created' && <Target className="h-3.5 w-3.5 text-green-500" />}
                                                        {item.activity_type === 'updated' && <FileText className="h-3.5 w-3.5 text-blue-500" />}
                                                        {item.activity_type === 'comment' && <MessageCircle className="h-3.5 w-3.5 text-purple-500" />}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.user.name}</p>
                                                            <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: item.description }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </>
                            )}
                        </Card>

                        {/* Notes */}
                        {opportunity.notes && (
                            <Card>
                                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-4 py-3">
                                    <CardTitle className="text-sm font-bold flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        {t('Internal Notes')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{opportunity.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
}
