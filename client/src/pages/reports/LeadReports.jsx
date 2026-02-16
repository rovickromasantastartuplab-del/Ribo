import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Target, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageTemplate } from '@/components/page-template';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { SummaryCards } from '@/components/reports/SummaryCards';
import { ChartCard } from '@/components/reports/ChartCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock Data
const mockSummary = {
    total_leads: 1250,
    converted_leads: 450,
    conversion_rate: 36.0,
    avg_conversion_time: 12
};

const mockMonthlyData = [
    { period: 'Jan', count: 120 },
    { period: 'Feb', count: 150 },
    { period: 'Mar', count: 180 },
    { period: 'Apr', count: 140 },
    { period: 'May', count: 190 },
    { period: 'Jun', count: 210 },
];

const mockDailyData = Array.from({ length: 30 }, (_, i) => ({
    period: `${i + 1}`,
    count: Math.floor(Math.random() * 20) + 5
}));

const mockLeadsBySource = [
    { name: 'Website', total: 400 },
    { name: 'Referral', total: 300 },
    { name: 'Social Media', total: 250 },
    { name: 'Email', total: 200 },
    { name: 'Others', total: 100 },
];

const COLORS = ['#3fa9f5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function LeadReports() {
    const { t } = useTranslation();
    const [chartView, setChartView] = useState('monthly');

    const chartData = chartView === 'daily' ? mockDailyData : mockMonthlyData;

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Reports') },
        { title: t('Lead Reports') }
    ];

    const summaryCards = [
        {
            title: t('Total Leads'),
            value: mockSummary.total_leads.toLocaleString(),
            icon: <Users className="h-6 w-6 text-blue-600" />,
            iconColor: 'bg-blue-50 dark:bg-blue-900/30'
        },
        {
            title: t('Converted Leads'),
            value: mockSummary.converted_leads.toLocaleString(),
            icon: <TrendingUp className="h-6 w-6 text-green-600" />,
            iconColor: 'bg-green-50 dark:bg-green-900/30'
        },
        {
            title: t('Conversion Rate'),
            value: `${mockSummary.conversion_rate.toFixed(1)}%`,
            icon: <Target className="h-6 w-6 text-purple-600" />,
            iconColor: 'bg-purple-50 dark:bg-purple-900/30'
        },
        {
            title: t('Avg Conversion Time'),
            value: `${mockSummary.avg_conversion_time} ${t('days')}`,
            icon: <Clock className="h-6 w-6 text-orange-600" />,
            iconColor: 'bg-orange-50 dark:bg-orange-900/30'
        }
    ];

    return (
        <PageTemplate title={t("Lead Reports")} url="/reports/leads" breadcrumbs={breadcrumbs} noPadding>
            <ReportFilters />

            <SummaryCards cards={summaryCards} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard
                    title={t('Lead Trend')}
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

                <ChartCard title={t('Leads by Source')}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockLeadsBySource}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="total"
                                >
                                    {mockLeadsBySource.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {mockLeadsBySource.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            <Card className="p-6 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('Lead Summary')}</h3>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Total Leads')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">{mockSummary.total_leads.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Converted Leads')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{mockSummary.converted_leads.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{t('Conversion Rate')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-purple-600">{mockSummary.conversion_rate.toFixed(2)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageTemplate>
    );
}
