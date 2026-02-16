import { FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputError from '@/components/InputError';
import TextLink from '@/components/TextLink';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/AuthLayout';
import AuthButton from '@/components/auth/AuthButton';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/supabaseClient';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrors({ general: error.message });
                setProcessing(false);
                return;
            }

            // Successful login
            navigate('/');
        } catch (error: any) {
            setErrors({ general: error.message || 'An error occurred during login' });
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your credentials to access your account"
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
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
                            <TextLink
                                to="/forgot-password"
                                className="text-sm transition-colors duration-200 no-underline hover:underline hover:underline-primary"
                                style={{ color: primaryColor }}
                                tabIndex={5}
                            >
                                Forgot password?
                            </TextLink>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center !mt-4 !mb-5">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onClick={() => setRemember(!remember)}
                            tabIndex={3}
                            className="w-[14px] h-[14px] border border-gray-300 rounded"
                        />
                        <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</Label>
                    </div>
                </div>

                {errors.general && (
                    <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        {errors.general}
                    </div>
                )}

                <AuthButton
                    tabIndex={4}
                    processing={processing}
                >
                    Log in
                </AuthButton>

                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Don't have an account?{' '}
                        <TextLink
                            to="/register"
                            className="font-medium hover:underline"
                            style={{ color: primaryColor }}
                            tabIndex={6}
                        >
                            Sign up
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
