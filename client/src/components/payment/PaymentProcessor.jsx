import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Loader2 } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import * as PaymentForms from './PaymentForms';

export function PaymentProcessor({
    plan,
    billingCycle,
    paymentMethods,
    currencySymbol = '$',
    onSuccess,
    onCancel
}) {
    const { t } = useTranslation();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    // Parse price safely
    const [currentPrice, setCurrentPrice] = useState(parseFloat(plan.price) || 0);

    useEffect(() => {
        setCurrentPrice(parseFloat(plan.price) || 0);
    }, [plan.price]);

    const originalPrice = currentPrice;
    const discountAmount = appliedCoupon ? (appliedCoupon.type === 'percentage' ? (originalPrice * appliedCoupon.value / 100) : appliedCoupon.value) : 0;
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error(t('Please enter a coupon code'));
            return;
        }

        setCouponLoading(true);
        // Mock API call
        setTimeout(() => {
            setCouponLoading(false);
            if (couponCode === 'INVALID') {
                toast.error(t('Invalid coupon code'));
                setAppliedCoupon(null);
            } else {
                setAppliedCoupon({ code: couponCode, type: 'percentage', value: 10 });
                toast.success(t('Coupon applied successfully (Mock: 10% off)'));
            }
        }, 1000);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handlePayNow = () => {
        if (!selectedPaymentMethod) {
            toast.error(t('Please select a payment method'));
            return;
        }
        setShowPaymentForm(true);
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
        setSelectedPaymentMethod('');
    };

    const enabledPaymentMethods = paymentMethods.filter(method => method.enabled);

    const renderPaymentForm = () => {
        const commonProps = {
            planId: plan.id,
            couponCode,
            billingCycle,
            onSuccess,
            onCancel: handlePaymentCancel,
            planPrice: finalPrice,
            currencySymbol
        };

        // Dynamically render the selected payment form from the PaymentForms export
        // Ensure the ID matches the export name in PaymentForms (e.g., 'stripe' -> StripePaymentForm)
        const formName = selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1) + 'PaymentForm';
        // Handle special naming cases if any, e.g. bank -> BankTransferForm
        let Component = PaymentForms[formName];

        if (selectedPaymentMethod === 'bank') Component = PaymentForms.BankTransferForm;
        if (selectedPaymentMethod === 'paiement') Component = PaymentForms.PaiementPaymentForm;

        // Fallback for others where ID matches key (e.g. stripe -> StripePaymentForm)
        // We need to map 'stripe' to 'StripePaymentForm'

        // Let's rely on the switch statement for clarity as in the original code, but use our mapped components
        switch (selectedPaymentMethod) {
            case 'stripe': return <PaymentForms.StripePaymentForm {...commonProps} />;
            case 'paypal': return <PaymentForms.PayPalPaymentForm {...commonProps} />;
            case 'bank': return <PaymentForms.BankTransferForm {...commonProps} />;
            case 'razorpay': return <PaymentForms.RazorpayPaymentForm {...commonProps} />;
            case 'mercadopago': return <PaymentForms.MercadoPagoPaymentForm {...commonProps} />;
            case 'paystack': return <PaymentForms.PaystackPaymentForm {...commonProps} />;
            case 'flutterwave': return <PaymentForms.FlutterwavePaymentForm {...commonProps} />;
            case 'paytabs': return <PaymentForms.PayTabsPaymentForm {...commonProps} />;
            case 'skrill': return <PaymentForms.SkrillPaymentForm {...commonProps} />;
            case 'coingate': return <PaymentForms.CoinGatePaymentForm {...commonProps} />;
            case 'payfast': return <PaymentForms.PayfastPaymentForm {...commonProps} />;
            case 'toyyibpay': return <PaymentForms.ToyyibPayPaymentForm {...commonProps} />;
            case 'paytr': return <PaymentForms.PayTRPaymentForm {...commonProps} />;
            case 'mollie': return <PaymentForms.MolliePaymentForm {...commonProps} />;
            case 'cashfree': return <PaymentForms.CashfreePaymentForm {...commonProps} />;
            case 'iyzipay': return <PaymentForms.IyzipayPaymentForm {...commonProps} />;
            case 'benefit': return <PaymentForms.BenefitPaymentForm {...commonProps} />;
            case 'ozow': return <PaymentForms.OzowPaymentForm {...commonProps} />;
            case 'easebuzz': return <PaymentForms.EasebuzzPaymentForm {...commonProps} />;
            case 'khalti': return <PaymentForms.KhaltiPaymentForm {...commonProps} />;
            case 'authorizenet': return <PaymentForms.AuthorizeNetPaymentForm {...commonProps} />;
            case 'fedapay': return <PaymentForms.FedaPayPaymentForm {...commonProps} />;
            case 'payhere': return <PaymentForms.PayHerePaymentForm {...commonProps} />;
            case 'cinetpay': return <PaymentForms.CinetPayPaymentForm {...commonProps} />;
            case 'paiement': return <PaymentForms.PaiementPaymentForm {...commonProps} />;
            case 'nepalste': return <PaymentForms.NepalstePaymentForm {...commonProps} />;
            case 'yookassa': return <PaymentForms.YooKassaPaymentForm {...commonProps} />;
            case 'aamarpay': return <PaymentForms.AamarpayPaymentForm {...commonProps} />;
            case 'midtrans': return <PaymentForms.MidtransPaymentForm {...commonProps} />;
            case 'paymentwall': return <PaymentForms.PaymentWallPaymentForm {...commonProps} />;
            case 'sspay': return <PaymentForms.SSPayPaymentForm {...commonProps} />;
            case 'tap': return <PaymentForms.TapPaymentForm {...commonProps} />;
            case 'xendit': return <PaymentForms.XenditPaymentForm {...commonProps} />;
            default: return <div>Unknown payment method</div>;
        }
    };

    if (showPaymentForm) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">{t('Complete Payment')}</h3>
                    <Button variant="outline" size="sm" onClick={handlePaymentCancel}>
                        {t('Back')}
                    </Button>
                </div>
                {renderPaymentForm()}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Plan Summary */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t(billingCycle)} {t('subscription')}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold">{currencySymbol} {plan.price}</div>
                            <div className="text-sm text-muted-foreground">
                                /{t(billingCycle)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-3">
                <Label>{t('Select Payment Method')}</Label>
                {enabledPaymentMethods.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('No payment methods available')}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {enabledPaymentMethods.map((method, index) => (
                            <Card
                                key={`${method.id}-${index}`}
                                className={`cursor-pointer transition-colors ${selectedPaymentMethod === method.id
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedPaymentMethod(method.id)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-primary">{method.icon}</div>
                                        <span className="font-medium">{method.name}</span>
                                        {selectedPaymentMethod === method.id && (
                                            <Badge variant="secondary" className="ml-auto">
                                                {t('Selected')}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Coupon Code */}
            <div className="space-y-3">
                <Label htmlFor="coupon">{t('Coupon Code')} ({t('Optional')})</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="coupon"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder={t('Enter coupon code')}
                            className="pr-10"
                            disabled={!!appliedCoupon}
                        />
                        <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {!appliedCoupon ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || couponLoading}
                        >
                            {couponLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                t('Apply')
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveCoupon}
                        >
                            {t('Remove')}
                        </Button>
                    )}
                </div>

                {appliedCoupon && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700 font-medium">
                                {t('Coupon Applied')}: {appliedCoupon.code}
                            </span>
                            <span className="text-green-600">
                                -{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `${currencySymbol}${appliedCoupon.value}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Price Summary */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{t('Subtotal')}</span>
                            <span>{currencySymbol}{originalPrice}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>{t('Discount')}</span>
                                <span>-{currencySymbol}{discountAmount}</span>
                            </div>
                        )}
                        <div className="border-t pt-2">
                            <div className="flex justify-between font-medium">
                                <span>{t('Total')}</span>
                                <span>{currencySymbol}{finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={handlePayNow}
                    disabled={enabledPaymentMethods.length === 0}
                    className="flex-1"
                >
                    {t('Pay')} {currencySymbol} {finalPrice}
                </Button>
            </div>
        </div>
    );
}
