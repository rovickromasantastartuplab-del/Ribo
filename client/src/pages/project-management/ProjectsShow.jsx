import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Calendar, User, Building2, AlertTriangle,
    Clock, LayoutGrid, BarChart3, DollarSign, MessageSquare
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock Data
const mockProject = {
    id: 1,
    name: 'Website Redesign',
    code: 'WEB-2024',
    description: 'Complete overhaul of the corporate website including new branding implementation and migration to Next.js.',
    status: 'active',
    priority: 'high',
    start_date: '2024-02-01',
    end_date: '2024-05-30',
    budget: 50000,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-10T15:30:00Z',
    creator: { name: 'Admin User' },
    assigned_users: [{ name: 'Sarah Wilson' }],
    account: {
        id: 1,
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '+1 (555) 123-4567'
    }
};

const mockStats = {
    totalTasks: 24,
    completedTasks: 14,
    progressPercentage: 58,
    taskStats: {
        'To Do': 6,
        'In Progress': 4,
        'Review': 2,
        'Done': 12
    },
    taskStatuses: [
        { id: 1, name: 'To Do', color: '#64748b' },
        { id: 2, name: 'In Progress', color: '#3b82f6' },
        { id: 3, name: 'Review', color: '#eab308' },
        { id: 4, name: 'Done', color: '#22c55e' }
    ]
};

const mockMeetings = [
    {
        id: 1,
        title: 'Project Kickoff',
        type: 'meeting',
        start_date: '2024-02-01T10:00:00Z',
        assigned_user: { name: 'Sarah Wilson' }
    },
    {
        id: 2,
        title: 'Weekly Sync',
        type: 'meeting',
        start_date: '2024-02-08T10:00:00Z',
        assigned_user: { name: 'Sarah Wilson' }
    }
];

export default function ProjectsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [project, setProject] = useState(mockProject);

    const formatDateTime = (dateString, showTime = true) => {
        if (!dateString) return '-';
        if (!showTime) return new Date(dateString).toLocaleDateString();
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-50 text-red-700 ring-red-600/20';
            case 'high': return 'bg-orange-50 text-orange-700 ring-orange-600/20';
            case 'medium': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'low': return 'bg-gray-50 text-gray-700 ring-gray-600/20';
            default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-50 text-green-700 ring-green-600/20';
            case 'completed': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'on_hold': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
            case 'inactive': return 'bg-gray-50 text-gray-700 ring-gray-600/20';
            default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Projects'), href: '/projects' },
        { title: project.name }
    ];

    const actions = [
        {
            label: t('Kanban View'),
            icon: <LayoutGrid className="h-4 w-4 mr-2" />,
            onClick: () => navigate(`/projects/${project.id}/kanban`)
        },
        {
            label: t('Gantt View'),
            icon: <BarChart3 className="h-4 w-4 mr-2" />,
            onClick: () => navigate(`/projects/${project.id}/gantt`)
        },
        {
            label: t('Back to Projects'),
            icon: <ArrowLeft className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => navigate('/projects')
        }
    ];

    return (
        <PageTemplate
            title={project.name}
            breadcrumbs={breadcrumbs}
            actions={actions}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <Card className="bg-white dark:bg-gray-900 border-none shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold dark:text-white mb-2">{project.name}</h1>
                                {project.code && (
                                    <p className="text-sm font-medium text-gray-500 mb-4 dark:text-gray-400">
                                        {t('Code')}: <span className="font-mono text-gray-700 dark:text-gray-300">{project.code}</span>
                                    </p>
                                )}
                                <p className="text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">{project.description}</p>
                            </div>
                            <div className="text-right ml-6 flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getPriorityColor(project.priority)}`}>
                                    <AlertTriangle className="h-3 w-3 mr-1.5" />
                                    {t(project.priority.charAt(0).toUpperCase() + project.priority.slice(1))}
                                </span>
                                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusColor(project.status)}`}>
                                    <Clock className="h-3 w-3 mr-1.5" />
                                    {t(project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1))}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Progress Chart */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="text-base font-semibold">{t('Task Progress')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('Overall Progress')}</span>
                                <span className="text-2xl font-bold text-blue-600">{mockStats.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                                    style={{ width: `${mockStats.progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className={`grid gap-4 mt-6 ${mockStats.taskStatuses.length <= 2 ? 'grid-cols-2' : mockStats.taskStatuses.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                {mockStats.taskStatuses.map((status) => (
                                    <div key={status.id} className="text-center p-4 rounded-xl border transition-all hover:shadow-md" style={{ backgroundColor: `${status.color}08`, borderColor: `${status.color}30` }}>
                                        <div className="text-2xl font-bold mb-1" style={{ color: status.color }}>
                                            {mockStats.taskStats[status.name] || 0}
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{status.name}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 pt-2">
                                {mockStats.completedTasks} {t('of')} {mockStats.totalTasks} {t('tasks completed')}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Project Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Account Information */}
                    <Card className="h-full">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
                                {t('Account Information')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Account Name')}</p>
                                <Link to={`/accounts/${project.account.id}`} className="text-sm font-bold text-blue-600 hover:underline mt-1 block">
                                    {project.account.name}
                                </Link>
                            </div>
                            {project.account.email && (
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">{t('Email')}</p>
                                    <p className="text-sm font-medium mt-1">{project.account.email}</p>
                                </div>
                            )}
                            {project.account.phone && (
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">{t('Phone')}</p>
                                    <p className="text-sm font-medium mt-1">{project.account.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Project Timeline */}
                    <Card className="h-full">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                {t('Timeline')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Start Date')}</p>
                                <p className="text-sm font-medium mt-1">{formatDateTime(project.start_date, false)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('End Date')}</p>
                                <p className="text-sm font-medium mt-1">{formatDateTime(project.end_date, false)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Created')}</p>
                                <p className="text-sm font-medium mt-1">{formatDateTime(project.created_at, false)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Budget & Assignment */}
                    <Card className="h-full">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                                {t('Budget & Assignment')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Budget')}</p>
                                <p className="text-lg font-bold text-green-600 mt-1">
                                    {project.budget ? formatCurrency(project.budget) : t('Not set')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Assigned To')}</p>
                                <div className="flex items-center mt-2 group cursor-default">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full mr-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                        <User className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {project.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{t('Created By')}</p>
                                <div className="flex items-center mt-2 group cursor-default">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full mr-2 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                        <User className="h-3.5 w-3.5 text-gray-500 group-hover:text-purple-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {project.creator?.name || t('Unknown')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activities */}
                {mockMeetings.length > 0 && (
                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                                {t('Activities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Meetings Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center pb-2 border-b">
                                        <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('Meetings')}</h4>
                                        <Badge variant="secondary" className="ml-2 text-xs">{mockMeetings.filter(m => m.type !== 'call').length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {mockMeetings.filter(m => m.type !== 'call').map((meeting) => (
                                            <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all bg-white dark:bg-gray-900 group">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{meeting.title}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDateTime(meeting.start_date)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <User className="h-3 w-3 mr-1" />
                                                            {meeting.assigned_user?.name || 'Unassigned'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/meetings/${meeting.id}`)}>{t('View')}</Button>
                                            </div>
                                        ))}
                                        {mockMeetings.filter(m => m.type !== 'call').length === 0 && (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
                                                <p className="text-sm text-gray-500">{t('No meetings found')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Calls Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center pb-2 border-b">
                                        <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('Calls')}</h4>
                                        <Badge variant="secondary" className="ml-2 text-xs">{mockMeetings.filter(m => m.type === 'call').length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {mockMeetings.filter(m => m.type === 'call').map((call) => (
                                            <div key={call.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all bg-white dark:bg-gray-900 group">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{call.title}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDateTime(call.start_date)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <User className="h-3 w-3 mr-1" />
                                                            {call.assigned_user?.name || 'Unassigned'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/meetings/${call.id}`)}>{t('View')}</Button>
                                            </div>
                                        ))}
                                        {mockMeetings.filter(m => m.type === 'call').length === 0 && (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
                                                <p className="text-sm text-gray-500">{t('No calls found')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageTemplate>
    );
}
