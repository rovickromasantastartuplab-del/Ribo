import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Calendar, DollarSign, Package, User, Building,
    Truck, FileText, Printer, Download, Check, X
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock Data
const mockQuote = {
    id: 1,
    quote_number: 'Q-2024-001',
    name: 'Website Redesign Proposal',
    description: 'Quote for the complete website redesign including design, development, and deployment.',
    status: 'sent',
    valid_until: '2024-03-01',
    subtotal: 4500,
    total_amount: 4950,
    currency: 'USD',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-02T11:20:00Z',
    creator: { name: 'Admin User' },
    assigned_users: [{ name: 'Sarah Wilson' }],
    account: { id: 1, name: 'Acme Corp' },
    contact: { id: 1, name: 'John Doe' },
    shipping_provider_type: { id: 1, name: 'FedEx' },
    billing_address: '123 Business St',
    billing_city: 'Tech City',
    billing_state: 'TC',
    billing_postal_code: '12345',
    billing_country: 'USA',
    billing_contact: { id: 1, name: 'John Doe' },
    shipping_address: '123 Business St',
    shipping_city: 'Tech City',
    shipping_state: 'TC',
    shipping_postal_code: '12345',
    shipping_country: 'USA',
    shipping_contact: { id: 1, name: 'John Doe' },
    products: [
        {
            id: 1,
            name: 'Frontend Development',
            pivot: {
                quantity: 40,
                unit_price: 100,
                total_price: 4000,
                discount_amount: 0,
                discount_type: 'none',
                discount_value: 0
            },
            tax: { name: 'VAT', rate: 10 }
        },
        {
            id: 2,
            name: 'Hosting Setup',
            pivot: {
                quantity: 1,
                unit_price: 500,
                total_price: 500,
                discount_amount: 0,
                discount_type: 'none',
                discount_value: 0
            },
            tax: { name: 'VAT', rate: 10 }
        }
    ]
};

export default function QuotesShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [quote, setQuote] = useState(mockQuote);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDateTime = (dateString, showTime = true) => {
        if (!dateString) return '-';
        if (!showTime) return new Date(dateString).toLocaleDateString();
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-50 text-gray-600 ring-gray-500/10',
            sent: 'bg-blue-50 text-blue-700 ring-blue-700/10',
            accepted: 'bg-green-50 text-green-700 ring-green-600/20',
            rejected: 'bg-red-50 text-red-700 ring-red-600/10',
            expired: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
        };

        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[status] || colors.draft}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || t('Draft')}
            </span>
        );
    };

    // Calculations
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    quote.products?.forEach((product) => {
        const lineTotal = Number(product.pivot.total_price) || 0;
        const discountAmount = Number(product.pivot.discount_amount) || 0;
        const finalLineTotal = lineTotal - discountAmount;

        subtotal += finalLineTotal;
        totalDiscount += discountAmount;

        if (product.tax) {
            totalTax += (finalLineTotal * Number(product.tax.rate)) / 100;
        }
    });

    const grandTotal = subtotal + totalTax;

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Quotes'), href: '/quotes' },
        { title: quote.quote_number }
    ];

    const actions = [
        {
            label: t('Convert to Order'),
            icon: <Check className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: () => console.log('Convert to Order')
        },
        {
            label: t('Download PDF'),
            icon: <Download className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => console.log('Download PDF')
        },
        {
            label: t('Print'),
            icon: <Printer className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => window.print()
        },
        {
            label: t('Back to Quotes'),
            icon: <ArrowLeft className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => navigate('/quotes')
        }
    ];

    return (
        <PageTemplate
            title={quote.quote_number}
            breadcrumbs={breadcrumbs}
            actions={actions}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <Card className="bg-white dark:bg-gray-900 border-none shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold dark:text-white mb-2">{quote.name}</h1>
                                <p className="text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">{quote.description}</p>
                            </div>
                            <div className="text-right ml-6">
                                {getStatusBadge(quote.status)}
                                <p className="text-sm font-medium text-gray-500 mt-2 font-mono">{quote.quote_number}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Total Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(quote.total_amount)}</h3>
                                </div>
                                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
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
                                    <h3 className="mt-2 text-2xl font-bold text-blue-600">{quote.products?.length || 0}</h3>
                                </div>
                                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Valid Until')}</p>
                                    <h3 className="mt-2 text-lg font-bold text-orange-600">{formatDateTime(quote.valid_until, false)}</h3>
                                </div>
                                <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Created')}</p>
                                    <h3 className="mt-2 text-lg font-bold text-purple-600">{formatDateTime(quote.created_at, false)}</h3>
                                </div>
                                <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quote Information */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="text-base font-semibold">{t('Quote Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Details')}</label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Quote Number')}</span>
                                            <span className="font-medium">{quote.quote_number}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Status')}</span>
                                            <span>{getStatusBadge(quote.status)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Created By')}</span>
                                            <span className="font-medium">{quote.creator?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Assigned To')}</span>
                                            <span className="font-medium">{quote.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Financials')}</label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Subtotal')}</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Discount Amount')}</span>
                                            <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Created At')}</span>
                                            <span className="font-medium">{formatDateTime(quote.created_at, false)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Updated At')}</span>
                                            <span className="font-medium">{formatDateTime(quote.updated_at, false)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Related Data */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="flex items-center text-base font-semibold">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            {t('Related Data')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {quote.account && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-green-600/80 uppercase mb-2">{t('Account')}</p>
                                    <Link
                                        to={`/accounts/${quote.account.id}`}
                                        className="text-base font-bold text-green-700 hover:text-green-900 hover:underline"
                                    >
                                        {quote.account.name}
                                    </Link>
                                </div>
                            )}
                            {quote.contact && (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-purple-600/80 uppercase mb-2">{t('Contact')}</p>
                                    <Link
                                        to={`/contacts/${quote.contact.id}`}
                                        className="text-base font-bold text-purple-700 hover:text-purple-900 hover:underline"
                                    >
                                        {quote.contact.name}
                                    </Link>
                                </div>
                            )}
                            {quote.shipping_provider_type && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-orange-600/80 uppercase mb-2">{t('Shipping Provider')}</p>
                                    <p className="text-base font-bold text-orange-700">
                                        {quote.shipping_provider_type.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Billing & Shipping Details */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="flex items-center text-base font-semibold">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {t('Billing & Shipping Details')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Billing */}
                            <div>
                                <h3 className="text-sm font-bold border-b pb-2 mb-4">{t('Billing Details')}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Contact')}</label>
                                        {quote.billing_contact ? (
                                            <Link to={`/contacts/${quote.billing_contact.id}`} className="text-sm font-medium text-blue-600 hover:underline mt-1 block">
                                                {quote.billing_contact.name}
                                            </Link>
                                        ) : <p className="text-sm mt-1">{t('-')}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Address')}</label>
                                        <p className="text-sm mt-1">{quote.billing_address || t('-')}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('City')}</label>
                                            <p className="text-sm mt-1">{quote.billing_city || t('-')}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('State')}</label>
                                            <p className="text-sm mt-1">{quote.billing_state || t('-')}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Postal Code')}</label>
                                            <p className="text-sm mt-1">{quote.billing_postal_code || t('-')}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Country')}</label>
                                            <p className="text-sm mt-1">{quote.billing_country || t('-')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping */}
                            <div>
                                <h3 className="text-sm font-bold border-b pb-2 mb-4">{t('Shipping Details')}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Contact')}</label>
                                        {quote.shipping_contact ? (
                                            <Link to={`/contacts/${quote.shipping_contact.id}`} className="text-sm font-medium text-blue-600 hover:underline mt-1 block">
                                                {quote.shipping_contact.name}
                                            </Link>
                                        ) : <p className="text-sm mt-1">{t('-')}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Address')}</label>
                                        <p className="text-sm mt-1">{quote.shipping_address || t('-')}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('City')}</label>
                                            <p className="text-sm mt-1">{quote.shipping_city || t('-')}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('State')}</label>
                                            <p className="text-sm mt-1">{quote.shipping_state || t('-')}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Postal Code')}</label>
                                            <p className="text-sm mt-1">{quote.shipping_postal_code || t('-')}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('Country')}</label>
                                            <p className="text-sm mt-1">{quote.shipping_country || t('-')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                <TableRow>
                                    <TableHead className="w-[40%]">{t('Product')}</TableHead>
                                    <TableHead className="text-right">{t('Quantity')}</TableHead>
                                    <TableHead className="text-right">{t('Unit Price')}</TableHead>
                                    <TableHead className="text-right">{t('Tax')}</TableHead>
                                    <TableHead className="text-right">{t('Total')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quote.products.map((product) => {
                                    const lineTotal = product.pivot.total_price;
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                                {product.pivot.discount_value > 0 && (
                                                    <span className="block text-xs text-red-500">
                                                        {t('Discount')}: {product.pivot.discount_type === 'percentage' ? `${product.pivot.discount_value}%` : formatCurrency(product.pivot.discount_value)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{product.pivot.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(product.pivot.unit_price)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="text-xs">
                                                    <div>{product.tax?.name}</div>
                                                    <div className="text-muted-foreground">({product.tax?.rate}%)</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(lineTotal)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow>
                                    <TableCell colSpan={4} className="text-right font-medium">{t('Subtotal')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={4} className="text-right font-medium">{t('Tax')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totalTax)}</TableCell>
                                </TableRow>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50 font-bold">
                                    <TableCell colSpan={4} className="text-right text-lg">{t('Grand Total')}</TableCell>
                                    <TableCell className="text-right text-lg text-green-600">{formatCurrency(grandTotal)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
