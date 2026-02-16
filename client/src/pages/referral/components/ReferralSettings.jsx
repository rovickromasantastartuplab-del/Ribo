import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Simple Textarea component shim until fully implemented
const Textarea = (props) => (
    <textarea
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);

export default function ReferralSettings({ settings }) {
    const { t } = useTranslation();
    const { toast } = useToast();


    const [data, setData] = useState({
        is_enabled: settings.is_enabled,
        commission_percentage: settings.commission_percentage,
        threshold_amount: settings.threshold_amount,
        guidelines: settings.guidelines || '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});


    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        // Mock API call
        setTimeout(() => {
            setProcessing(false);
            toast({ title: t('Referral settings updated successfully') });
        }, 1000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Referral Program Settings')}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_enabled"
                            checked={data.is_enabled}
                            onCheckedChange={(checked) => setData({ ...data, is_enabled: checked })}
                        />
                        <Label htmlFor="is_enabled">{t('Enable Referral Program')}</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="commission_percentage">{t('Commission Percentage (%)')}</Label>
                            <Input
                                id="commission_percentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={data.commission_percentage}
                                onChange={(e) => setData({ ...data, commission_percentage: e.target.value })}
                            />
                            {errors.commission_percentage && (
                                <p className="text-sm text-red-500">{errors.commission_percentage}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="threshold_amount">{t('Minimum Threshold Amount ($)')}</Label>
                            <Input
                                id="threshold_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.threshold_amount}
                                onChange={(e) => setData({ ...data, threshold_amount: e.target.value })}
                            />
                            {errors.threshold_amount && (
                                <p className="text-sm text-red-500">{errors.threshold_amount}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="guidelines">{t('Referral Guidelines')}</Label>
                        <Textarea
                            id="guidelines"
                            value={data.guidelines}
                            onChange={(e) => setData({ ...data, guidelines: e.target.value })}
                            placeholder={t('Enter referral program guidelines and terms...')}
                            rows={6}
                        />
                        {errors.guidelines && (
                            <p className="text-sm text-red-500">{errors.guidelines}</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? t('Saving...') : t('Save Settings')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
