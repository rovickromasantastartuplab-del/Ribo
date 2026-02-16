import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Play, CheckCircle, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageTemplate } from '@/components/page-template';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { SummaryCards } from '@/components/reports/SummaryCards';
import { ChartCard } from '@/components/reports/ChartCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock Data
const mockSummary = {
    total_projects: 45,
    active_projects: 12,
    completed_projects: 28,
    completion_rate: 62.22
};

const mockMonthlyData = [
    { period: 'Jan', count: 5 },
    { period: 'Feb', count: 8 },
    { period: 'Mar', count: 12 },
    { period: 'Apr', count: 10 },
    { period: 'May', count: 15 },
    { period: 'Jun', count: 18 },
];

const mockDailyData = Array.from({ length: 30 }, (_, i) => ({
    period: `${i + 1}`,
    count: Math.floor(Math.random() * 5) + 1
}));

const mockProjectsByStatus = [
    { status: 'active', total: 12 },
    { status: 'completed', total: 28 },
    { status: 'on_hold', total: 3 },
    { status: 'inactive', total: 2 },
];

const COLORS = ['#3fa9f5', '#10B981', '#F59E0B', '#6B7280'];

export default function ProjectReports() {
    const { t } = useTranslation();
    const [chartView, setChartView] = useState('monthly');

    const chartData = chartView === 'daily' ? mockDailyData : mockMonthlyData;

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Reports') },
        { title: t('Project Reports') }
    ];

    const summaryCards = [
        {
            title: t('Total Projects'),
            value: mockSummary.total_projects.toLocaleString(),
            icon: <Briefcase className="h-6 w-6 text-blue-600" />,
            iconColor: 'bg-blue-50 dark:bg-blue-900/30'
        },
        {
            title: t('Active Projects'),
            value: mockSummary.active_projects.toLocaleString(),
            icon: <Play className="h-6 w-6 text-green-600" />,
            iconColor: 'bg-green-50 dark:bg-green-900/30'
        },
        {
            title: t('Completed Projects'),
            value: mockSummary.completed_projects.toLocaleString(),
            icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
            iconColor: 'bg-purple-50 dark:bg-purple-900/30'
        },
        {
            title: t('Completion Rate'),
            value: `${mockSummary.completion_rate.toFixed(1)}%`,
            icon: <Percent className="h-6 w-6 text-orange-600" />,
            iconColor: 'bg-orange-50 dark:bg-orange-900/30'
        }
    ];

    const getStatusLabel = (status) => {
        const labels = {
            active: t('Active'),
            completed: t('Completed'),
            on_hold: t('On Hold'),
            inactive: t('Inactive')
        };
        return labels[status] || status;
    };

    return (
        <PageTemplate title={t("Project Reports")} url="/reports/projects" breadcrumbs={breadcrumbs} noPadding>
            <ReportFilters />

            <SummaryCards cards={summaryCards} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard
                    title={t('Project Trend')}
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
                                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title={t('Projects by Status')}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockProjectsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="total"
                                >
                                    {mockProjectsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => [value, getStatusLabel(props.payload.status)]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {mockProjectsByStatus.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{getStatusLabel(entry.status)}</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            <Card className="p-6 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('Project Summary')}</h3>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Total Projects')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">{mockSummary.total_projects.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Active Projects')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">{mockSummary.active_projects.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t('Completed Projects')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600 font-semibold">{mockSummary.completed_projects.toLocaleString()}</td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{t('Completion Rate')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-600">{mockSummary.completion_rate.toFixed(2)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageTemplate>
    );
}
