import { useTranslation } from 'react-i18next';
import { Package, CheckCircle, DollarSign, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageTemplate } from '@/components/page-template';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { SummaryCards } from '@/components/reports/SummaryCards';
import { ChartCard } from '@/components/reports/ChartCard';
import { Card } from '@/components/ui/card';

// Mock Data
const mockSummary = {
    total_products: 150,
    active_products: 135,
    total_revenue: 125000,
    best_seller: 'Premium Wireless Headphones'
};

const mockProductSales = [
    { name: 'Premium Wireless Headphones', quantity: 450, revenue: 45000 },
    { name: 'Ergonomic Office Chair', quantity: 210, revenue: 31500 },
    { name: 'Mechanical Keyboard', quantity: 180, revenue: 18000 },
    { name: 'USB-C Hub', quantity: 320, revenue: 12800 },
    { name: 'Laptop Stand', quantity: 150, revenue: 7500 },
    { name: 'Gaming Mouse', quantity: 120, revenue: 6000 },
];

const COLORS = ['#3fa9f5', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

export default function ProductReports() {
    const { t } = useTranslation();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Reports') },
        { title: t('Product Reports') }
    ];

    const summaryCards = [
        {
            title: t('Total Products'),
            value: mockSummary.total_products.toLocaleString(),
            icon: <Package className="h-6 w-6 text-blue-600" />,
            iconColor: 'bg-blue-50 dark:bg-blue-900/30'
        },
        {
            title: t('Active Products'),
            value: mockSummary.active_products.toLocaleString(),
            icon: <CheckCircle className="h-6 w-6 text-green-600" />,
            iconColor: 'bg-green-50 dark:bg-green-900/30'
        },
        {
            title: t('Total Revenue'),
            value: formatCurrency(mockSummary.total_revenue),
            icon: <DollarSign className="h-6 w-6 text-purple-600" />,
            iconColor: 'bg-purple-50 dark:bg-purple-900/30'
        },
        {
            title: t('Best Seller'),
            value: mockSummary.best_seller || t('-'),
            icon: <Award className="h-6 w-6 text-orange-600" />,
            iconColor: 'bg-orange-50 dark:bg-orange-900/30'
        }
    ];

    return (
        <PageTemplate title={t("Product Reports")} url="/reports/product-reports" breadcrumbs={breadcrumbs} noPadding>
            <ReportFilters />

            <SummaryCards cards={summaryCards} />

            <div className="grid grid-cols-1 gap-6 mb-6">
                <ChartCard title={t('Top Products by Revenue')}>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mockProductSales}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), t('Revenue')]}
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                    {mockProductSales.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            <Card className="p-6 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('Product Performance')}</h3>
                <div className="overflow-x-auto -mx-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Product Name')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Quantity Sold')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Revenue')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {mockProductSales.map((product, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{product.quantity.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(product.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageTemplate>
    );
}
