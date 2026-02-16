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

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [terms, setTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        password_confirmation?: string;
        terms?: string;
        general?: string;
    }>({});
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Validate
        const newErrors: typeof errors = {};
        if (!name) newErrors.name = 'Name is required';
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (password !== passwordConfirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }
        if (!terms) newErrors.terms = 'You must accept the terms and conditions';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setProcessing(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) {
                setErrors({ general: error.message });
                setProcessing(false);
                return;
            }

            // Check if email confirmation is required
            if (data.user && !data.session) {
                // Email confirmation required
                navigate('/verify-email');
            } else {
                // Auto-confirmed, redirect to onboarding to create company
                navigate('/onboarding');
            }
        } catch (error: any) {
            setErrors({ general: error.message || 'An error occurred during registration' });
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            description="Enter your details below to get started"
        >
            <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Full name</Label>
                        <div className="relative">
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg transition-all duration-200"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    <div className="relative">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Email</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
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

                    <div>
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg transition-all duration-200"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">Confirm password</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg transition-all duration-200"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center !mt-4 !mb-5">
                        <Checkbox
                            id="terms"
                            checked={terms}
                            onClick={() => setTerms(!terms)}
                            tabIndex={5}
                            className="w-[14px] h-[14px] border border-gray-300 rounded"
                        />
                        <Label htmlFor="terms" className="ml-2 text-gray-600 dark:text-gray-400 text-sm">I agree to the{' '}
                            <a
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: primaryColor }}
                            >
                                Terms and Conditions
                            </a>
                        </Label>
                    </div>
                    <InputError message={errors.terms} />
                </div>

                {errors.general && (
                    <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        {errors.general}
                    </div>
                )}

                <AuthButton
                    tabIndex={6}
                    processing={processing}
                    className="w-full text-white py-2.5 text-sm font-medium tracking-wide transition-all duration-200 rounded-md shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                >
                    Create account
                </AuthButton>

                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Already have an account?{' '}
                        <TextLink
                            to="/login"
                            className="font-medium hover:underline"
                            style={{ color: primaryColor }}
                            tabIndex={7}
                        >
                            Log in
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
