import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, DollarSign, Users, Gift, Settings as SettingsIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import ReferralDashboard from './components/ReferralDashboard';
import PayoutRequests from './components/PayoutRequests';
import ReferralSettings from './components/ReferralSettings';

// Mock Data Loader
const useReferralData = () => {
    // In a real app, this would be an API call
    return {
        userType: 'superadmin', // Change to 'company' to test company view
        settings: {
            is_enabled: true,
            commission_percentage: 10,
            threshold_amount: 50,
            guidelines: "Share your unique link and earn 10% commission on every subscription.",
        },
        stats: {
            totalReferralUsers: 154,
            pendingPayouts: 23,
            totalCommissionPaid: 12500,
            totalEarned: 1500,
            availableBalance: 450,
            totalReferrals: 45,
            referredUsersCount: 12,
            topCompanies: [
                { id: 1, name: "Acme Corp", email: "contact@acme.com", referral_count: 45, total_earned: 4500 },
                { id: 2, name: "Globex", email: "info@globex.com", referral_count: 32, total_earned: 3200 },
                { id: 3, name: "Soylent Corp", email: "sales@soylent.com", referral_count: 28, total_earned: 2800 },
            ],
            monthlyReferrals: { Jan: 10, Feb: 15, Mar: 20 },
            monthlyPayouts: { Jan: 500, Feb: 750, Mar: 1000 },
        },
        payoutRequests: {
            data: [
                { id: 1, amount: 200, status: 'pending', created_at: '2023-10-01', company: { name: 'Acme Corp', email: 'contact@acme.com' } },
                { id: 2, amount: 150, status: 'approved', created_at: '2023-09-15', company: { name: 'Globex', email: 'contact@globex.com' } },
            ]
        },
        referralLink: "https://ribo.app/ref/my-unique-code",
        recentReferredUsers: [
            { id: 1, name: "Alice Johnson", email: "alice@example.com", plan: { name: "Pro Plan" } },
            { id: 2, name: "Bob Smith", email: "bob@example.com", plan: null },
        ]
    };
};

export default function ReferralProgram() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Mock Data
    const { userType, settings, stats, payoutRequests, referralLink, recentReferredUsers } = useReferralData();

    const [activeSection, setActiveSection] = useState('dashboard');

    const sidebarNavItems = [
        {
            title: t('Dashboard'),
            href: '#dashboard',
            icon: <BarChart3 className="h-4 w-4 mr-2" />,
        },
        {
            title: t('Referred Users'),
            href: '/referral/referred-users',
            icon: <Users className="h-4 w-4 mr-2" />,
            external: true, // This indicates it links to a separate page
        },
        {
            title: t('Payout Requests'),
            href: '#payout-requests',
            icon: <DollarSign className="h-4 w-4 mr-2" />,
        },
        ...(userType === 'superadmin' ? [{
            title: t('Settings'),
            href: '#settings',
            icon: <SettingsIcon className="h-4 w-4 mr-2" />,
        }] : [])
    ];

    const dashboardRef = useRef(null);
    const payoutRequestsRef = useRef(null);
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            const dashboardPosition = dashboardRef.current?.offsetTop || 0;
            const payoutRequestsPosition = payoutRequestsRef.current?.offsetTop || 0;
            const settingsPosition = settingsRef.current?.offsetTop || 0;

            if (userType === 'superadmin' && scrollPosition >= settingsPosition) {
                setActiveSection('settings');
            } else if (scrollPosition >= payoutRequestsPosition) {
                setActiveSection('payout-requests');
            } else {
                setActiveSection('dashboard');
            }
        };

        window.addEventListener('scroll', handleScroll);

        const hash = location.hash.replace('#', '');
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(hash);
            }
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [userType, location.hash]);

    const handleNavClick = (href) => {
        const id = href.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
            navigate(`#${id}`, { replace: true });
        }
    };

    return (
        <PageTemplate
            title={t('Referral Program')}
            url="/referral"
        >
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-64 flex-shrink-0">
                    <div className="sticky top-20">
                        <ScrollArea className="h-[calc(100vh-5rem)]">
                            <div className="pr-4 space-y-1">
                                {sidebarNavItems.map((item) => (
                                    item.external ? (
                                        <Button
                                            key={item.href}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => navigate(item.href)}
                                        >
                                            {item.icon}
                                            {item.title}
                                        </Button>
                                    ) : (
                                        <Button
                                            key={item.href}
                                            variant="ghost"
                                            className={cn('w-full justify-start', {
                                                'bg-muted font-medium': activeSection === item.href.replace('#', ''),
                                            })}
                                            onClick={() => handleNavClick(item.href)}
                                        >
                                            {item.icon}
                                            {item.title}
                                        </Button>
                                    )
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <div className="flex-1">
                    <section id="dashboard" ref={dashboardRef} className="mb-8 pt-4 -mt-4">
                        <h2 className="text-xl font-semibold mb-4">{t('Dashboard')}</h2>
                        <ReferralDashboard
                            userType={userType}
                            stats={stats}
                            referralLink={referralLink}
                            recentReferredUsers={recentReferredUsers}
                        />
                    </section>

                    <section id="payout-requests" ref={payoutRequestsRef} className="mb-8 pt-4 -mt-4">
                        <h2 className="text-xl font-semibold mb-4">{t('Payout Requests')}</h2>
                        <PayoutRequests
                            userType={userType}
                            payoutRequests={payoutRequests}
                            settings={settings}
                            stats={stats}
                        />
                    </section>

                    {userType === 'superadmin' && (
                        <section id="settings" ref={settingsRef} className="mb-8 pt-4 -mt-4">
                            <h2 className="text-xl font-semibold mb-4">{t('Settings')}</h2>
                            <ReferralSettings settings={settings} />
                        </section>
                    )}
                </div>
            </div>
            <Toaster />
        </PageTemplate>
    );
}
