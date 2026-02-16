import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Building, Briefcase
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock Data
const mockContact = {
    id: 1,
    name: 'Sarah Wilson',
    position: 'Chief Operations Officer',
    email: 'sarah.wilson@acme.com',
    phone: '+1 (555) 987-6543',
    status: 'active',
    address: '123 Business Rd, Suite 100, New York, NY 10001',
    assigned_users: [{ name: 'Admin User' }],
    account: { id: 1, name: 'Acme Corp' },
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-20T11:00:00Z'
};

export default function ContactsShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [contact, setContact] = useState(mockContact);

    const getStatusBadge = (status) => {
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${status === 'active'
                ? 'bg-green-50 text-green-700 ring-green-600/20'
                : 'bg-red-50 text-red-700 ring-red-600/10'
                }`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || t('Active')}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Contacts'), href: '/contacts' },
        { title: contact.name }
    ];

    return (
        <PageTemplate
            title={contact.name}
            breadcrumbs={breadcrumbs}
            actions={[
                {
                    label: t('Back to Contacts'),
                    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                    variant: 'outline',
                    onClick: () => navigate('/contacts')
                }
            ]}
        >
            <div className="mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold dark:text-white">{contact.name}</h1>
                            <p className="text-sm text-muted-foreground mt-2">{contact.position || t('No position specified')}</p>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(contact.status)}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                        <CardTitle className="text-base font-semibold">{t('Contact Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Email Address')}</label>
                                        <p className="text-sm font-medium mt-1">{contact.email || t('-')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Phone Number')}</label>
                                        <p className="text-sm font-medium mt-1">{contact.phone || t('-')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Position')}</label>
                                        <p className="text-sm font-medium mt-1">{contact.position || t('-')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase">{t('Account')}</label>
                                        {contact.account ? (
                                            <Link
                                                to={`/accounts/${contact.account.id}`}
                                                className="text-sm font-bold text-blue-600 hover:underline mt-1 block"
                                            >
                                                {contact.account.name}
                                            </Link>
                                        ) : (
                                            <p className="text-sm font-medium mt-1">{t('-')}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('Assigned To')}</label>
                                    <p className="text-sm font-medium mt-1">{contact.assigned_users?.map(u => u.name).join(', ') || t('Unassigned')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Information */}
                {contact.address && (
                    <Card>
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                            <CardTitle className="flex items-center text-base font-semibold">
                                <MapPin className="h-4 w-4 mr-2" />
                                {t('Address')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm font-medium">{contact.address}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Record Information */}
                <Card>
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b px-6 py-4">
                        <CardTitle className="text-base font-semibold">{t('Record Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase">{t('Created At')}</label>
                                <p className="text-sm font-medium mt-1">{formatDate(contact.created_at)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase">{t('Updated At')}</label>
                                <p className="text-sm font-medium mt-1">{formatDate(contact.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
