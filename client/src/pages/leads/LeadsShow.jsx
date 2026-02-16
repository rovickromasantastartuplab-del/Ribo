import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, User, Building, MapPin, FileText, Phone, Mail,
    Globe, DollarSign, Users, Calendar, Target, Briefcase,
    UserCheck, MessageCircle, EyeOff, Trash2, Send, Edit, Check, X
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';

// Mock Data
const mockLead = {
    id: 1,
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john.doe@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'https://acme.com',
    position: 'Marketing Director',
    address: '123 Business Rd, Suite 100\nNew York, NY 10001',
    status: 'active',
    is_converted: false,
    value: 12500,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-21T15:30:00Z',
    notes: 'Very interested in our enterprise plan. Needs a demo by next Friday.',
    lead_status: { name: 'Initial Contact' },
    lead_source: { name: 'Website' },
    assigned_users: [{ name: 'Admin User' }],
    creator: { name: 'Admin User' },
    account_industry: { name: 'Technology' },
    campaign: { id: 101, name: 'Winter Outreach 2024', budget: 5000, campaign_type: { name: 'Email' } }
};

const mockStreamItems = [
    {
        id: 1,
        title: 'Lead created',
        activity_type: 'created',
        created_at: '2024-01-20T10:00:00Z',
        user: { name: 'Admin User' },
        description: 'Lead was created manually.'
    },
    {
        id: 2,
        title: 'Status updated',
        activity_type: 'updated',
        field_changed: 'lead_status_id',
        created_at: '2024-01-20T14:30:00Z',
        user: { name: 'Admin User' },
        description: 'Changed status from <b>New</b> to <b>Initial Contact</b>'
    },
    {
        id: 3,
        title: 'Added a comment',
        activity_type: 'comment',
        created_at: '2024-01-21T09:15:00Z',
        user: { name: 'Admin User' },
        description: 'Follow-up call scheduled for Monday.'
    }
];

export default function LeadsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [lead, setLead] = useState(mockLead);
    const [streamItems, setStreamItems] = useState(mockStreamItems);
    const [showStream, setShowStream] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status) => {
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${status === 'active'
                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                }`}>
                {status === 'active' ? t('Active') : t('Inactive')}
            </span>
        );
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Leads'), href: '/leads' },
        { title: lead.name }
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
            title={lead.name}
            breadcrumbs={breadcrumbs}
            actions={[
                {
                    label: t('Back to Leads'),
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                    variant: 'outline',
                    onClick: () => navigate('/leads')
                }
            ]}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
                            <p className="text-sm text-gray-500 mt-2">{lead.company || t('No company provided')}</p>
                        </div>
                        <div className="flex gap-2">
                            {getStatusBadge(lead.status)}
                            {lead.is_converted && (
                                <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                    {t('Converted')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{t('Lead Value')}</p>
                                    <h3 className="text-xl font-bold text-green-600 truncate">{formatCurrency(lead.value)}</h3>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{t('Status')}</p>
                                    <h3 className="text-lg font-bold text-blue-600 truncate leading-tight">{lead.lead_status?.name || t('-')}</h3>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{t('Source')}</p>
                                    <h3 className="text-lg font-bold text-orange-600 truncate leading-tight">{lead.lead_source?.name || t('-')}</h3>
                                </div>
                                <div className="rounded-full bg-orange-100 p-3">
                                    <Building className="h-4 w-4 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{t('Created')}</p>
                                    <h3 className="text-lg font-bold text-purple-600 truncate leading-tight">{formatDate(lead.created_at)}</h3>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact & Address Information */}
                        <Card>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
                                <CardTitle className="flex items-center text-base font-semibold">
                                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {t('Contact & Address Information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Full Name')}</label>
                                            <p className="text-sm font-medium mt-1">{lead.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Email Address')}</label>
                                            <div className="flex items-center mt-1">
                                                <Mail className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                                <p className="text-sm font-medium">{lead.email || t('-')}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Phone Number')}</label>
                                            <div className="flex items-center mt-1">
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                                <p className="text-sm font-medium">{lead.phone || t('-')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Company')}</label>
                                            <div className="flex items-center mt-1">
                                                <Building className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                                <p className="text-sm font-medium">{lead.company || t('-')}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Website')}</label>
                                            <div className="flex items-center mt-1">
                                                <Globe className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                                {lead.website ? (
                                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                        {lead.website}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm font-medium">{t('-')}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Address')}</label>
                                            <div className="flex items-start mt-1">
                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-2 mt-0.5" />
                                                <p className="text-sm font-medium whitespace-pre-line">{lead.address || t('-')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
                                <CardTitle className="flex items-center text-base font-semibold">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {t('Additional Information')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Industry')}</label>
                                        <p className="text-sm font-medium mt-1">{lead.account_industry?.name || t('-')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Position')}</label>
                                        <p className="text-sm font-medium mt-1">{lead.position || t('-')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Assigned To')}</label>
                                        <p className="text-sm font-medium mt-1">{lead.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Campaign')}</label>
                                        <p className="text-sm font-medium mt-1">{lead.campaign?.name || t('-')}</p>
                                    </div>
                                </div>
                                {lead.notes && (
                                    <div className="mt-6 pt-6 border-t font-medium">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Notes')}</label>
                                        <p className="text-sm mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border">{lead.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Activity Stream */}
                        <Card className="flex flex-col h-full max-h-[800px]">
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
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-z-10 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 lg:before:from-gray-200 before:to-transparent">
                                            {streamItems.map((item, index) => (
                                                <div key={item.id} className="relative pl-10">
                                                    <span className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-gray-100 ring-4 ring-white shadow-sm">
                                                        {item.activity_type === 'created' && <User className="h-3.5 w-3.5 text-green-500" />}
                                                        {item.activity_type === 'updated' && <FileText className="h-3.5 w-3.5 text-blue-500" />}
                                                        {item.activity_type === 'comment' && <MessageCircle className="h-3.5 w-3.5 text-purple-500" />}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{item.user.name}</p>
                                                            <span className="text-[10px] text-gray-400 font-medium">{formatDate(item.created_at)}</span>
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
                    </div>
                </div>
            </div>

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    toast.success(t('Activity deleted (Simulated)'));
                    setIsDeleteModalOpen(false);
                }}
                itemName={t('this activity')}
            />
        </PageTemplate>
    );
}
