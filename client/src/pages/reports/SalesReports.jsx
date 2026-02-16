import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShoppingCart, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { PageTemplate } from '@/components/page-template';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { SummaryCards } from '@/components/reports/SummaryCards';
import { ChartCard } from '@/components/reports/ChartCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock Data
const mockSummary = {
    total_sales: 45000,
    total_orders: 320,
    avg_order_value: 140.625,
    growth_rate: 15.5
};

const mockMonthlyData = [
    { period: 'Jan', revenue: 5000 },
    { period: 'Feb', revenue: 6500 },
    { period: 'Mar', revenue: 8000 },
    { period: 'Apr', revenue: 7200 },
    { period: 'May', revenue: 9500 },
    { period: 'Jun', revenue: 8800 },
];

const mockDailyData = Array.from({ length: 30 }, (_, i) => ({
    period: `${i + 1}`,
    revenue: Math.floor(Math.random() * 500) + 100
}));

const mockSalesByStatus = [
    { status: 'Paid', amount: 35000 },
    { status: 'Partial', amount: 5000 },
    { status: 'Unpaid', amount: 3000 },
    { status: 'Overdue', amount: 2000 },
];

const COLORS = ['#10B981', '#F59E0B', '#3fa9f5', '#EF4444'];

export default function SalesReports() {
    const { t } = useTranslation();
    const [chartView, setChartView] = useState('monthly');

    const chartData = chartView === 'daily' ? mockDailyData : mockMonthlyData;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Reports') },
        { title: t('Sales Reports') }
    ];

    const summaryCards = [
        {
            title: t('Total Sales'),
            value: formatCurrency(mockSummary.total_sales),
            icon: <DollarSign className="h-6 w-6 text-green-600" />,
            iconColor: 'bg-green-50 dark:bg-green-900/30'
        },
        {
            title: t('Total Orders'),
            value: mockSummary.total_orders.toLocaleString(),
            icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
            iconColor: 'bg-blue-50 dark:bg-blue-900/30'
        },
        {
            title: t('Avg Order Value'),
            value: formatCurrency(mockSummary.avg_order_value),
            icon: <Target className="h-6 w-6 text-purple-600" />,
            iconColor: 'bg-purple-50 dark:bg-purple-900/30'
        },
        {
            title: t('Growth Rate'),
            value: `${mockSummary.growth_rate.toFixed(1)}%`,
            icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
            iconColor: 'bg-orange-50 dark:bg-orange-900/30'
        }
    ];

    return (
        <PageTemplate title={t("Sales Reports")} url="/reports/sales" breadcrumbs={breadcrumbs} noPadding>
            <ReportFilters />

            <SummaryCards cards={summaryCards} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard
                    title={t('Sales Trend')}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={chartView === 'daily' ? 'default' : 'outline'}
                                onClick={() => setChartView('daily')}
                            >
                                {t('Daily')}
                            </Button>
                            <Button
                                size="sm"
                                variant={chartView === 'monthly' ? 'default' : 'outline'}
                                onClick={() => setChartView('monthly')}
                            >
                                {t('Monthly')}
                            </Button>
                        </div>
                    }
                >
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), t('Revenue')]}
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title={t('Sales by Status')}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockSalesByStatus}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), t('Amount')]}
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {mockSalesByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            <Card className="p-6 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('Sales Summary')}</h3>
                <div className="overflow-x-auto -mx-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Metric')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Value')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Total Sales')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(mockSummary.total_sales)}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Total Orders')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">{mockSummary.total_orders.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{t('Average Order Value')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-purple-600">{formatCurrency(mockSummary.avg_order_value)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageTemplate>
    );
}
