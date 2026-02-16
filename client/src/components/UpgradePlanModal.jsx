import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';

export function UpgradePlanModal({
    isOpen,
    onClose,
    onConfirm,
    plans,
    currentPlanId,
    companyName
}) {
    const { t } = useTranslation();
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [isYearly, setIsYearly] = useState(false);

    // Filter plans based on billing period
    const filteredPlans = plans.filter(plan => {
        const duration = plan.duration.toLowerCase();
        return isYearly ? duration === 'yearly' : duration === 'monthly';
    });

    // Initialize with current plan ID when modal opens
    useEffect(() => {
        if (isOpen && filteredPlans && filteredPlans.length > 0) {
            const currentPlan = filteredPlans.find(plan => plan.is_current === true);

            if (currentPlan) {
                setSelectedPlanId(currentPlan.id);
            } else if (currentPlanId) {
                const planExists = filteredPlans.find(plan => plan.id === currentPlanId);
                setSelectedPlanId(planExists ? currentPlanId : filteredPlans[0].id);
            } else {
                setSelectedPlanId(filteredPlans[0].id);
            }
        }
    }, [isOpen, plans, isYearly, currentPlanId, filteredPlans]);

    // Reset selected plan when switching billing periods if current selection is not available
    useEffect(() => {
        if (filteredPlans.length > 0 && selectedPlanId) {
            const currentSelected = filteredPlans.find(plan => plan.id === selectedPlanId);
            if (!currentSelected) {
                setSelectedPlanId(filteredPlans[0].id);
            }
        }
    }, [isYearly, filteredPlans, selectedPlanId]);

    const handleConfirm = () => {
        if (selectedPlanId) {
            onConfirm(selectedPlanId, isYearly ? 'yearly' : 'monthly');
        }
    };

    const formatCurrency = (amount) => {
        return window.appSettings?.formatCurrency ? window.appSettings.formatCurrency(amount) : `$${amount}`;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("Upgrade Plan for")} {companyName}</DialogTitle>
                    <DialogDescription>
                        {t("Select a new plan for this company")}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Billing Period Toggle */}
                    <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                        <span className={`text-sm font-medium ${!isYearly ? 'text-primary' : 'text-gray-500'}`}>
                            {t('Monthly')}
                        </span>
                        <Switch
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                            className="data-[state=checked]:bg-primary"
                        />
                        <span className={`text-sm font-medium ${isYearly ? 'text-primary' : 'text-gray-500'}`}>
                            {t('Yearly')}
                        </span>
                        {isYearly && (
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                {t('Save up to 20%')}
                            </Badge>
                        )}
                    </div>

                    <RadioGroup
                        value={selectedPlanId?.toString() || ""}
                        onValueChange={(value) => setSelectedPlanId(parseInt(value))}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1">
                            {filteredPlans.length > 0 ? filteredPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-lg border p-4 cursor-pointer transition-all ${selectedPlanId === plan.id ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                        } ${plan.is_current ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={plan.id.toString()}
                                                id={`plan-${plan.id}`}
                                                className="h-5 w-5"
                                            />
                                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                                        </div>
                                        {plan.is_current && (
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800">
                                                {t("Current")}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center mb-2">
                                        <CreditCard className="mr-1.5 h-4 w-4 text-muted-foreground" />
                                        <p className="text-xl font-bold text-primary">
                                            {formatCurrency(plan.price)}
                                        </p>
                                        <span className="text-sm text-muted-foreground ml-1">/ {plan.duration.toLowerCase()}</span>
                                    </div>

                                    {plan.description && (
                                        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                                    )}

                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('Plan Limits')}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{plan.max_users === 0 ? '∞' : plan.max_users}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('Users')}</div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{plan.max_projects === 0 ? '∞' : plan.max_projects}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('Projects')}</div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{plan.max_contacts === 0 ? '∞' : plan.max_contacts}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('Contacts')}</div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{plan.max_accounts === 0 ? '∞' : plan.max_accounts}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('Accounts')}</div>
                                            </div>
                                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center col-span-2">
                                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{plan.storage_limit ? `${plan.storage_limit}GB` : '1GB'}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('Storage')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    <p>{t('No plans available for')} {isYearly ? t('yearly') : t('monthly')} {t('billing')}</p>
                                </div>
                            )}
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t("Cancel")}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedPlanId || filteredPlans.length === 0}
                    >
                        {t("Upgrade Plan")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
