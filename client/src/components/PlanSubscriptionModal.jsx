import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { PaymentProcessor } from '@/components/payment/PaymentProcessor';

export function PlanSubscriptionModal({
    isOpen,
    onClose,
    plan,
    billingCycle,
    paymentMethods,
    currencySymbol
}) {
    const { t } = useTranslation();

    const handlePaymentSuccess = () => {
        onClose();
        // Simulate refresh
        window.location.reload();
    };

    const enabledPaymentMethods = paymentMethods ? paymentMethods.filter(method => method.enabled) : [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{t('Subscribe to {{planName}}', { planName: plan?.name })}</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 pr-2">
                    {plan && (
                        <PaymentProcessor
                            plan={plan}
                            billingCycle={billingCycle}
                            paymentMethods={enabledPaymentMethods}
                            currencySymbol={currencySymbol}
                            onSuccess={handlePaymentSuccess}
                            onCancel={onClose}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
