import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Calendar, User, Building, AlertTriangle,
    CheckCircle, FileText, Clock, MessageSquare
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock Data
const mockCase = {
    id: 1001,
    subject: 'Unable to access dashboard',
    description: 'User reported receiving a 500 error when trying to load the main dashboard. This started happening after the latest deployment.',
    status: 'in_progress',
    priority: 'high',
    case_type: 'bug',
    created_at: '2024-01-20T09:30:00Z',
    updated_at: '2024-01-21T14:15:00Z',
    creator: { name: 'Sarah Wilson' },
    assigned_users: [{ name: 'Admin User' }],
    account: { id: 1, name: 'Acme Corp' },
    contact: { id: 1, name: 'Sarah Wilson' }
};

const mockMeetings = [
    {
        id: 1,
        title: 'Debug Session',
        type: 'meeting',
        start_date: '2024-01-21T10:00:00Z',
        assigned_user: { name: 'Admin User' }
    },
    {
        id: 2,
        title: 'Follow-up Call',
        type: 'call',
        start_date: '2024-01-22T15:00:00Z',
        assigned_user: { name: 'Admin User' }
    }
];

export default function CasesShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [caseData, setCaseData] = useState(mockCase);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'bg-gray-50 text-gray-700 ring-gray-600/20',
            medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
            urgent: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[priority] || colors.low}`}>
                {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const colors = {
            new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            in_progress: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
            pending: 'bg-orange-50 text-orange-700 ring-orange-600/20',
            resolved: 'bg-green-50 text-green-700 ring-green-600/20',
            closed: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[status] || colors.new}`}>
                {status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    const getCaseTypeLabel = (type) => {
        const labels = {
            support: t('Support'),
            bug: t('Bug Report'),
            feature_request: t('Feature Request'),
            complaint: t('Complaint'),
            inquiry: t('Inquiry')
        };
        return labels[type] || type;
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Cases'), href: '/cases' },
        { title: caseData.subject }
    ];

    return (
        <PageTemplate
            title={caseData.subject}
            breadcrumbs={breadcrumbs}
            actions={[
                {
                    label: t('Back to Cases'),
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                    variant: 'outline',
                    onClick: () => navigate('/cases')
                }
            ]}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-xl font-bold dark:text-white">{caseData.subject}</h1>
                            <p className="text-sm text-gray-500 mt-2">{caseData.description || t('No description provided')}</p>
                        </div>
                        <div className="text-right ml-6">
                            <div className="flex items-center justify-end gap-3 mb-2">
                                {getPriorityBadge(caseData.priority)}
                                {getStatusBadge(caseData.status)}
                            </div>
                            <p className="text-sm font-medium text-gray-500 font-mono">#{caseData.id}</p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Priority')}</p>
                                    <div className="mt-2">{getPriorityBadge(caseData.priority)}</div>
                                </div>
                                <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Status')}</p>
                                    <div className="mt-2">{getStatusBadge(caseData.status)}</div>
                                </div>
                                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Case Type')}</p>
                                    <h3 className="mt-2 text-lg font-bold text-purple-600">{getCaseTypeLabel(caseData.case_type)}</h3>
                                </div>
                                <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Created')}</p>
                                    <h3 className="mt-2 text-sm font-bold text-blue-600">{new Date(caseData.created_at).toLocaleDateString()}</h3>
                                </div>
                                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Case Information */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                        <CardTitle className="text-base font-semibold">{t('Case Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Case ID')}</label>
                                    <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-fit mt-1">#{caseData.id}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Created By')}</label>
                                    <p className="text-sm font-medium mt-1">{caseData.creator?.name || t('-')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Priority')}</label>
                                    <div className="mt-1">{getPriorityBadge(caseData.priority)}</div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Assigned To')}</label>
                                    <p className="text-sm font-medium mt-1">{caseData.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Created At')}</label>
                                    <p className="text-sm font-medium mt-1">{formatDateTime(caseData.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Updated At')}</label>
                                    <p className="text-sm font-medium mt-1">{formatDateTime(caseData.updated_at)}</p>
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
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {caseData.account && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-green-600/80 uppercase mb-2">{t('Account')}</p>
                                    <Link
                                        to={`/accounts/${caseData.account.id}`}
                                        className="text-base font-bold text-green-700 hover:text-green-900 hover:underline"
                                    >
                                        {caseData.account.name}
                                    </Link>
                                </div>
                            )}
                            {caseData.contact && (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30 hover:shadow-sm transition-all">
                                    <p className="text-xs font-bold text-purple-600/80 uppercase mb-2">{t('Contact')}</p>
                                    <Link
                                        to={`/contacts/${caseData.contact.id}`}
                                        className="text-base font-bold text-purple-700 hover:text-purple-900 hover:underline"
                                    >
                                        {caseData.contact.name}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Activities */}
                {mockMeetings.length > 0 && (
                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-8 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                {t('Activities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Meetings */}
                                <div>
                                    <div className="flex items-center mb-4">
                                        <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Meetings')}</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {mockMeetings.filter(m => m.type === 'meeting').map((meeting) => (
                                            <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white dark:bg-gray-900">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{meeting.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(meeting.start_date)}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/meetings/${meeting.id}`)}>{t('View')}</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Calls */}
                                <div>
                                    <div className="flex items-center mb-4">
                                        <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Calls')}</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {mockMeetings.filter(m => m.type === 'call').map((call) => (
                                            <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white dark:bg-gray-900">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{call.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(call.start_date)}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => navigate(`/calls/${call.id}`)}>{t('View')}</Button>
                                            </div>
                                        ))}
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
