import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Calendar, DollarSign, Package, User, Building,
    FileText, Plus, EyeOff, Trash2, Send, Check, X, Printer, Download
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock Data
const mockInvoice = {
    id: 1,
    invoice_number: 'INV-2024-001',
    name: 'Web Development Services',
    description: 'Invoice for website redesign project - Phase 1',
    status: 'partially_paid',
    invoice_date: '2024-02-01',
    due_date: '2024-02-15',
    subtotal: 5000,
    total_amount: 5500,
    currency: 'USD',
    notes: 'Thank you for your business.',
    terms: 'Net 15 days.',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-05T14:30:00Z',
    creator: { name: 'Admin User' },
    assigned_users: [{ name: 'Sarah Wilson' }],
    account: { id: 1, name: 'Acme Corp' },
    contact: { id: 1, name: 'John Doe' },
    sales_order: { id: 1, name: 'SO-2024-001' },
    quote: { id: 1, name: 'Q-2024-001' },
    billing_address: '123 Business St',
    billing_city: 'Tech City',
    billing_state: 'TC',
    billing_postal_code: '12345',
    billing_country: 'USA',
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
            name: 'UI/UX Design',
            pivot: {
                quantity: 10,
                unit_price: 100,
                total_price: 1000,
                discount_amount: 0,
                discount_type: 'none',
                discount_value: 0
            },
            tax: { name: 'VAT', rate: 10 }
        }
    ],
    payments: [
        {
            id: 1,
            payment_id: 'PAY-001',
            amount: 2000,
            payment_method: 'bank_transfer',
            payment_type: 'partial',
            status: 'completed',
            processed_at: '2024-02-05T10:00:00Z'
        }
    ]
};

export default function InvoicesShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [invoice, setInvoice] = useState(mockInvoice);

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
            paid: 'bg-green-50 text-green-700 ring-green-600/20',
            partially_paid: 'bg-orange-50 text-orange-800 ring-orange-600/20',
            overdue: 'bg-red-50 text-red-700 ring-red-600/10',
            cancelled: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
        };

        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[status] || colors.draft}`}>
                {status === 'partially_paid' ? t('Partially Paid') : (status?.charAt(0).toUpperCase() + status?.slice(1) || t('Draft'))}
            </span>
        );
    };

    // Calculations
    const paidAmount = invoice.payments?.reduce((total, payment) => {
        return payment.status === 'completed' ? total + payment.amount : total;
    }, 0) || 0;

    const dueAmount = Math.max(0, invoice.total_amount - paidAmount);

    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    invoice.products?.forEach((product) => {
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
        { title: t('Invoices'), href: '/invoices' },
        { title: invoice.invoice_number }
    ];

    const actions = [
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
            label: t('Back to Invoices'),
            icon: <ArrowLeft className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => navigate('/invoices')
        }
    ];

    return (
        <PageTemplate
            title={invoice.invoice_number}
            breadcrumbs={breadcrumbs}
            actions={actions}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <Card className="bg-white dark:bg-gray-900 border-none shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold dark:text-white mb-2">{invoice.name}</h1>
                                <p className="text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">{invoice.description}</p>
                            </div>
                            <div className="text-right ml-6">
                                {getStatusBadge(invoice.status)}
                                <p className="text-sm font-medium text-gray-500 mt-2 font-mono">{invoice.invoice_number}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Total Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(invoice.total_amount)}</h3>
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
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Paid Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(paidAmount)}</h3>
                                </div>
                                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Due Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(dueAmount)}</h3>
                                </div>
                                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                                    <DollarSign className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice Information */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="text-base font-semibold">{t('Invoice Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Details')}</label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Invoice Number')}</span>
                                            <span className="font-medium">{invoice.invoice_number}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Status')}</span>
                                            <span>{getStatusBadge(invoice.status)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Created By')}</span>
                                            <span className="font-medium">{invoice.creator?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Assigned To')}</span>
                                            <span className="font-medium">{invoice.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Dates')}</label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Invoice Date')}</span>
                                            <span className="font-medium">{formatDateTime(invoice.invoice_date, false)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Due Date')}</span>
                                            <span className="font-medium text-red-600">{formatDateTime(invoice.due_date, false)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Created At')}</span>
                                            <span className="font-medium">{formatDateTime(invoice.created_at, false)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{t('Updated At')}</span>
                                            <span className="font-medium">{formatDateTime(invoice.updated_at, false)}</span>
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
                            {invoice.account && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-green-600/80 uppercase mb-2">{t('Account')}</p>
                                    <Link
                                        to={`/accounts/${invoice.account.id}`}
                                        className="text-base font-bold text-green-700 hover:text-green-900 hover:underline"
                                    >
                                        {invoice.account.name}
                                    </Link>
                                </div>
                            )}
                            {invoice.sales_order && (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-purple-600/80 uppercase mb-2">{t('Sales Order')}</p>
                                    <Link
                                        to={`/sales-orders/${invoice.sales_order.id}`}
                                        className="text-base font-bold text-purple-700 hover:text-purple-900 hover:underline"
                                    >
                                        {invoice.sales_order.name}
                                    </Link>
                                </div>
                            )}
                            {invoice.quote && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-orange-600/80 uppercase mb-2">{t('Quote')}</p>
                                    <Link
                                        to={`/quotes/${invoice.quote.id}`}
                                        className="text-base font-bold text-orange-700 hover:text-orange-900 hover:underline"
                                    >
                                        {invoice.quote.name}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Details */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="flex items-center text-base font-semibold">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {t('Billing Details')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase">{t('Contact')}</label>
                                {invoice.contact ? (
                                    <Link to={`/contacts/${invoice.contact.id}`} className="text-sm font-medium text-blue-600 hover:underline mt-1 block">
                                        {invoice.contact.name}
                                    </Link>
                                ) : <p className="text-sm mt-1">{t('-')}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase">{t('Address')}</label>
                                <p className="text-sm mt-1">{invoice.billing_address || t('-')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase">{t('City')}</label>
                                <p className="text-sm mt-1">{invoice.billing_city || t('-')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase">{t('State/Country')}</label>
                                <p className="text-sm mt-1">{invoice.billing_state}, {invoice.billing_country}</p>
                                <p className="text-sm text-muted-foreground">{invoice.billing_postal_code}</p>
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
                                {invoice.products.map((product) => {
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

                {/* Payment History */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="flex items-center text-base font-semibold">
                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                            {t('Payment History')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('Date')}</TableHead>
                                    <TableHead>{t('Method')}</TableHead>
                                    <TableHead>{t('Type')}</TableHead>
                                    <TableHead>{t('Transaction ID')}</TableHead>
                                    <TableHead>{t('Status')}</TableHead>
                                    <TableHead className="text-right">{t('Amount')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{formatDateTime(payment.processed_at)}</TableCell>
                                        <TableCell className="capitalize">{payment.payment_method?.replace('_', ' ')}</TableCell>
                                        <TableCell className="capitalize">{payment.payment_type}</TableCell>
                                        <TableCell className="font-mono text-xs">{payment.payment_id}</TableCell>
                                        <TableCell>
                                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className={payment.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                                    </TableRow>
                                ))}
                                {(!invoice.payments || invoice.payments.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {t('No payments found')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
