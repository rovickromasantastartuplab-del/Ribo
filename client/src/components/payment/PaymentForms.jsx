import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/custom-toast';

// Generic Mock Payment Form
const MockPaymentForm = ({ name, onSuccess, onCancel, planPrice, currency }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        toast.loading(`Processing ${name} payment...`);
        setTimeout(() => {
            toast.dismiss();
            toast.success('Payment successful (Mock)');
            onSuccess();
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
            <div className="text-sm font-medium mb-2">{name} Checkout</div>
            <div className="text-2xl font-bold mb-4">{currency || '$'} {planPrice}</div>

            <div className="space-y-2">
                <Label>Card Holder / Account Name</Label>
                <Input placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
                <Label>Mock Details</Label>
                <Input placeholder="Enter any mock data" required />
            </div>

            <div className="flex gap-2 mt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Pay Now</Button>
            </div>
        </form>
    );
};

export const StripePaymentForm = (props) => <MockPaymentForm name="Stripe" {...props} />;
export const PayPalPaymentForm = (props) => <MockPaymentForm name="PayPal" {...props} />;
export const BankTransferForm = (props) => <MockPaymentForm name="Bank Transfer" {...props} />;
export const RazorpayPaymentForm = (props) => <MockPaymentForm name="Razorpay" {...props} />;
export const MercadoPagoPaymentForm = (props) => <MockPaymentForm name="MercadoPago" {...props} />;
export const PaystackPaymentForm = (props) => <MockPaymentForm name="Paystack" {...props} />;
export const FlutterwavePaymentForm = (props) => <MockPaymentForm name="Flutterwave" {...props} />;
export const PayTabsPaymentForm = (props) => <MockPaymentForm name="PayTabs" {...props} />;
export const SkrillPaymentForm = (props) => <MockPaymentForm name="Skrill" {...props} />;
export const CoinGatePaymentForm = (props) => <MockPaymentForm name="CoinGate" {...props} />;
export const PayfastPaymentForm = (props) => <MockPaymentForm name="Payfast" {...props} />;
export const ToyyibPayPaymentForm = (props) => <MockPaymentForm name="ToyyibPay" {...props} />;
export const PayTRPaymentForm = (props) => <MockPaymentForm name="PayTR" {...props} />;
export const MolliePaymentForm = (props) => <MockPaymentForm name="Mollie" {...props} />;
export const CashfreePaymentForm = (props) => <MockPaymentForm name="Cashfree" {...props} />;
export const IyzipayPaymentForm = (props) => <MockPaymentForm name="Iyzipay" {...props} />;
export const BenefitPaymentForm = (props) => <MockPaymentForm name="Benefit" {...props} />;
export const OzowPaymentForm = (props) => <MockPaymentForm name="Ozow" {...props} />;
export const EasebuzzPaymentForm = (props) => <MockPaymentForm name="Easebuzz" {...props} />;
export const KhaltiPaymentForm = (props) => <MockPaymentForm name="Khalti" {...props} />;
export const AuthorizeNetPaymentForm = (props) => <MockPaymentForm name="AuthorizeNet" {...props} />;
export const FedaPayPaymentForm = (props) => <MockPaymentForm name="FedaPay" {...props} />;
export const PayHerePaymentForm = (props) => <MockPaymentForm name="PayHere" {...props} />;
export const CinetPayPaymentForm = (props) => <MockPaymentForm name="CinetPay" {...props} />;
export const PaiementPaymentForm = (props) => <MockPaymentForm name="Paiement Pro" {...props} />;
export const NepalstePaymentForm = (props) => <MockPaymentForm name="Nepalste" {...props} />;
export const YooKassaPaymentForm = (props) => <MockPaymentForm name="YooKassa" {...props} />;
export const AamarpayPaymentForm = (props) => <MockPaymentForm name="Aamarpay" {...props} />;
export const MidtransPaymentForm = (props) => <MockPaymentForm name="Midtrans" {...props} />;
export const PaymentWallPaymentForm = (props) => <MockPaymentForm name="PaymentWall" {...props} />;
export const SSPayPaymentForm = (props) => <MockPaymentForm name="SSPay" {...props} />;
export const TapPaymentForm = (props) => <MockPaymentForm name="Tap" {...props} />;
export const XenditPaymentForm = (props) => <MockPaymentForm name="Xendit" {...props} />;
