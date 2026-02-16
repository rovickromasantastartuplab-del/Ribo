import { FormEventHandler, useState } from 'react';
import InputError from '@/components/InputError';
import TextLink from '@/components/TextLink';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/AuthLayout';
import AuthButton from '@/components/auth/AuthButton';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { supabase } from '@/supabaseClient';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
    const [status, setStatus] = useState('');
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setErrors({ general: error.message });
                setProcessing(false);
                return;
            }

            setStatus('Password reset link has been sent to your email');
            setProcessing(false);
        } catch (error: any) {
            setErrors({ general: error.message || 'An error occurred' });
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot your password?"
            description="Enter your email to receive a password reset link"
            icon={<Mail className="h-7 w-7" style={{ color: primaryColor }} />}
            status={status}
            statusType="success"
        >
            <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Email</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg transition-all duration-200"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>
                </div>

                {errors.general && (
                    <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        {errors.general}
                    </div>
                )}

                <AuthButton
                    tabIndex={2}
                    processing={processing}
                    className="w-full text-white py-2.5 text-sm font-medium tracking-wide transition-all duration-200 rounded-md shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                >
                    Email password reset link
                </AuthButton>

                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Remember your password?{' '}
                        <TextLink
                            to="/login"
                            className="font-medium hover:underline"
                            style={{ color: primaryColor }}
                            tabIndex={3}
                        >
                            Back to login
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
