import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2, X, Globe, FileText, Bot, BarChart2, Mail, Box, Store, Users, HardDrive, Plus, Sparkles, Crown, Zap, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/custom-toast';
import { PlanSubscriptionModal } from '@/components/PlanSubscriptionModal';

// Mock Data for Plans
const MOCK_PLANS = [
    {
        id: 1,
        name: 'Starter',
        price: 29,
        duration: 'Monthly',
        description: 'Perfect for small businesses just getting started.',
        trial_days: 14,
        features: ['Custom Domain', 'Analytics', 'Email Support'],
        stats: { users: 5, projects: 10, storage: '10GB' },
        status: true,
        recommended: false,
        is_current: true,
        is_trial_available: false
    },
    {
        id: 2,
        name: 'Pro',
        price: 79,
        duration: 'Monthly',
        description: 'Everything you need to scale your business.',
        trial_days: 14,
        features: ['Custom Domain', 'Analytics', 'Email Support', 'Priority Support', 'AI Integration'],
        stats: { users: 20, projects: 50, storage: '100GB' },
        status: true,
        recommended: true,
        is_current: false,
        is_trial_available: true
    },
    {
        id: 3,
        name: 'Enterprise',
        price: 199,
        duration: 'Monthly',
        description: 'Advanced features for large teams and organizations.',
        trial_days: 30,
        features: ['Custom Domain', 'Analytics', 'Email Support', 'Priority Support', 'AI Integration', 'API Access', 'SSO'],
        stats: { users: 'Unlimited', projects: 'Unlimited', storage: '1TB' },
        status: true,
        recommended: false,
        is_current: false,
        is_trial_available: true
    }
];

const MOCK_PAYMENT_METHODS = [
    { id: 'stripe', name: 'Stripe', enabled: true, icon: <span className="font-bold">Stripe</span> },
    { id: 'paypal', name: 'PayPal', enabled: true, icon: <span className="font-bold">PayPal</span> },
    { id: 'bank', name: 'Bank Transfer', enabled: true, icon: <span className="font-bold">Bank</span> }
];

export default function Plans({ isAdmin = false }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [plans, setPlans] = useState(MOCK_PLANS);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Mock User State
    const currentPlan = MOCK_PLANS[0];
    const userTrialUsed = false;

    const handleBillingCycleChange = (value) => {
        setBillingCycle(value);
        // In real app, fetch plans for selected cycle
        toast.info(`Switched to ${value} billing (Mock)`);
    };

    const handleStartTrial = (planId) => {
        toast.loading(t('Starting trial...'));
        setTimeout(() => {
            toast.dismiss();
            toast.success(t('Trial started successfully (Mock)'));
        }, 1000);
    };

    const handleSubscribe = async (planId) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            setSelectedPlan({ ...plan, paymentMethods: { stripe_key: 'mock' } }); // Mock payment settings
            setIsSubscriptionModalOpen(true);
        }
    };

    const handlePlanRequest = (planId) => {
        toast.success(t('Plan requested successfully (Mock)'));
    };

    const getFeatureIcon = (feature) => {
        switch (feature) {
            case 'Custom Domain': return <Globe className="h-4 w-4" />;
            case 'Analytics': return <BarChart2 className="h-4 w-4" />;
            case 'Email Support': return <Mail className="h-4 w-4" />;
            case 'API Access': return <Box className="h-4 w-4" />;
            case 'Priority Support': return <Users className="h-4 w-4" />;
            case 'Storage': return <HardDrive className="h-4 w-4" />;
            case 'AI Integration': return <Bot className="h-4 w-4" />;
            default: return <CheckCircle2 className="h-4 w-4" />;
        }
    };

    const getActionButton = (plan) => {
        if (currentPlan && currentPlan.id === plan.id) {
            return (
                <Button disabled className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    {t('Current Plan')}
                </Button>
            );
        }

        if (plan.is_trial_available && !userTrialUsed) {
            return (
                <div className="space-y-2">
                    <Button onClick={() => handleStartTrial(plan.id)} variant="outline" className="w-full">
                        <Zap className="h-4 w-4 mr-2" />
                        {t('Start {{days}} Day Trial', { days: plan.trial_days })}
                    </Button>
                    <Button onClick={() => handleSubscribe(plan.id)} className="w-full">
                        {t('Subscribe Now')}
                    </Button>
                </div>
            );
        }

        return (
            <Button onClick={() => handleSubscribe(plan.id)} className="w-full">
                {t('Subscribe Now')}
            </Button>
        );
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Plans') }
    ];

    return (
        <PageTemplate
            title={t("Plans")}
            description={t("Manage subscription plans for your customers")}
            url="/plans"
            breadcrumbs={breadcrumbs}
        >
            <div className="space-y-8">
                {/* Header with controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            {isAdmin ? t("Subscription Plans") : t("Choose Your Plan")}
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                            {isAdmin
                                ? t("Create and manage subscription plans.")
                                : t("Select the perfect plan for your business needs")
                            }
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Tabs
                            value={billingCycle}
                            onValueChange={handleBillingCycleChange}
                            className="w-full sm:w-[400px]"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="monthly">{t("Monthly")}</TabsTrigger>
                                <TabsTrigger value="yearly">
                                    {t("Yearly")}
                                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                                        {t("Save 20%")}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {isAdmin && (
                            <Button className="w-full sm:w-auto" onClick={() => navigate('/plans/create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t("Add Plan")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Plans grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`group relative h-full flex flex-col ${plan.recommended ? 'z-10 scale-[1.02]' : ''}`}
                        >
                            {/* Card with decorative elements */}
                            <div className={`
                absolute inset-0 rounded-2xl
                ${plan.recommended
                                    ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30'
                                    : 'bg-gradient-to-br from-gray-100/80 via-gray-50/50 to-transparent border-gray-200/80 dark:from-gray-800/80 dark:via-gray-900/50 dark:border-gray-700'
                                }
                border shadow-lg transition-all duration-300
                group-hover:shadow-xl group-hover:shadow-primary/5
                overflow-hidden
              `}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16 opacity-70"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-full -ml-12 -mb-12 opacity-50"></div>
                            </div>

                            {/* Recommended indicator */}
                            {plan.recommended && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                                    <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm font-medium">
                                        <Sparkles className="h-4 w-4" />
                                        {t("Recommended")}
                                    </div>
                                </div>
                            )}

                            {/* Content container */}
                            <div className="relative z-10 flex flex-col h-full p-6 pt-8">
                                {/* Plan header */}
                                <div className="mb-6">
                                    <h3 className={`text-2xl font-bold mb-2 ${plan.recommended ? 'text-primary' : ''}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1.5 mb-3">
                                        <span className={`text-3xl font-extrabold ${plan.recommended ? 'text-primary' : ''}`}>
                                            ${plan.price}
                                        </span>
                                        <span className="text-muted-foreground text-sm">
                                            /{t(billingCycle)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Features list */}
                                <div className="flex-1 mb-8">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm">
                                                <div className={`mt-0.5 ${plan.recommended ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {getFeatureIcon(feature)}
                                                </div>
                                                <span className="text-foreground/90">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action button */}
                                <div className="mt-auto pt-6 border-t border-border/50">
                                    {getActionButton(plan)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPlan && (
                <PlanSubscriptionModal
                    isOpen={isSubscriptionModalOpen}
                    onClose={() => setIsSubscriptionModalOpen(false)}
                    plan={selectedPlan}
                    billingCycle={billingCycle}
                    paymentMethods={MOCK_PAYMENT_METHODS}
                    currencySymbol="$"
                />
            )}
        </PageTemplate>
    );
}
