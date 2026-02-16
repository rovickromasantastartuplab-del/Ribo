import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, UserCheck, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageTemplate } from '@/components/page-template';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { SummaryCards } from '@/components/reports/SummaryCards';
import { ChartCard } from '@/components/reports/ChartCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock Data
const mockSummary = {
    total_contacts: 850,
    new_contacts: 45,
    active_contacts: 720,
    contact_lifetime_value: 1250.50
};

const mockMonthlyData = [
    { period: 'Jan', count: 400 },
    { period: 'Feb', count: 420 },
    { period: 'Mar', count: 480 },
    { period: 'Apr', count: 510 },
    { period: 'May', count: 580 },
    { period: 'Jun', count: 650 },
];

const mockDailyData = Array.from({ length: 30 }, (_, i) => ({
    period: `${i + 1}`,
    count: Math.floor(Math.random() * 10) + 1
}));

const mockTopContacts = [
    { name: 'John Smith', total_spent: 12500, order_count: 15 },
    { name: 'Sarah Wilson', total_spent: 9800, order_count: 12 },
    { name: 'Michael Brown', total_spent: 7500, order_count: 9 },
    { name: 'Emily Davis', total_spent: 6200, order_count: 7 },
    { name: 'James Taylor', total_spent: 5400, order_count: 6 },
];

export default function CustomerReports() {
    const { t } = useTranslation();
    const [chartView, setChartView] = useState('monthly');

    const chartData = chartView === 'daily' ? mockDailyData : mockMonthlyData;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Reports') },
        { title: t('Contact Reports') }
    ];

    const summaryCards = [
        {
            title: t('Total Contacts'),
            value: mockSummary.total_contacts.toLocaleString(),
            icon: <Users className="h-6 w-6 text-blue-600" />,
            iconColor: 'bg-blue-50 dark:bg-blue-900/30'
        },
        {
            title: t('New Contacts'),
            value: mockSummary.new_contacts.toLocaleString(),
            icon: <UserPlus className="h-6 w-6 text-green-600" />,
            iconColor: 'bg-green-50 dark:bg-green-900/30'
        },
        {
            title: t('Active Contacts'),
            value: mockSummary.active_contacts.toLocaleString(),
            icon: <UserCheck className="h-6 w-6 text-purple-600" />,
            iconColor: 'bg-purple-50 dark:bg-purple-900/30'
        },
        {
            title: t('Contact Lifetime Value'),
            value: formatCurrency(mockSummary.contact_lifetime_value),
            icon: <DollarSign className="h-6 w-6 text-orange-600" />,
            iconColor: 'bg-orange-50 dark:bg-orange-900/30'
        }
    ];

    return (
        <PageTemplate title={t("Contact Reports")} url="/reports/customers" breadcrumbs={breadcrumbs} noPadding>
            <ReportFilters />

            <SummaryCards cards={summaryCards} />

            <div className="grid grid-cols-1 gap-6 mb-6">
                <ChartCard
                    title={t('Contact Growth')}
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
                                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#3fa9f5" strokeWidth={3} dot={{ r: 4, fill: '#3fa9f5' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            <Card className="p-6 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('Top Contacts')}</h3>
                <div className="overflow-x-auto -mx-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Contact Name')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Total Spent')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Order Count')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {mockTopContacts.map((contact, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{contact.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{formatCurrency(contact.total_spent)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{contact.order_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageTemplate>
    );
}
