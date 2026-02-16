import { FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextLink from '@/components/TextLink';
import AuthLayout from '@/layouts/AuthLayout';
import AuthButton from '@/components/auth/AuthButton';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { supabase } from '@/supabaseClient';
import { Mail } from 'lucide-react';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.email) {
                const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: user.email,
                });

                if (error) {
                    setStatus('Failed to send verification email. Please try again.');
                } else {
                    setStatus('A new verification link has been sent to your email address.');
                }
            }

            setProcessing(false);
        } catch (error: any) {
            setStatus('Failed to send verification email. Please try again.');
            setProcessing(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <AuthLayout
            title="Verify your email"
            description="Please verify your email address by clicking on the link we just emailed to you."
            icon={<Mail className="h-7 w-7" style={{ color: primaryColor }} />}
            status={status}
            statusType="success"
        >
            <form onSubmit={submit} className="space-y-5">
                <AuthButton
                    processing={processing}
                    className="w-full text-white py-2.5 text-sm font-medium tracking-wide transition-all duration-200 rounded-md shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                >
                    RESEND EMAIL
                </AuthButton>

                <div className="text-center mt-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="font-medium hover:underline"
                            style={{ color: primaryColor }}
                        >
                            Log out
                        </button>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
