import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import InputError from '@/components/InputError';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/AuthLayout';
import AuthButton from '@/components/auth/AuthButton';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';

export default function CreateCompany() {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Validation
        if (!companyName.trim()) {
            setErrors({ companyName: 'Company name is required' });
            setProcessing(false);
            return;
        }

        if (companyName.trim().length < 2) {
            setErrors({ companyName: 'Company name must be at least 2 characters' });
            setProcessing(false);
            return;
        }

        if (companyName.trim().length > 100) {
            setErrors({ companyName: 'Company name must not exceed 100 characters' });
            setProcessing(false);
            return;
        }

        try {
            // Save company data to localStorage (frontend-only)
            const companyData = {
                company_name: companyName.trim(),
                onboarding_completed: true,
                created_at: new Date().toISOString()
            };

            localStorage.setItem('user_company', JSON.stringify(companyData));

            // Redirect to dashboard
            navigate('/');
        } catch (error) {
            setErrors({ general: error.message || 'An error occurred while creating your workspace' });
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Name your workspace"
            description="This will be your shared workspace. You can change it later."
            icon={<Building2 className="h-8 w-8" style={{ color: primaryColor }} />}
        >
            <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-4">
                    <div className="relative">
                        <Label htmlFor="companyName" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">
                            Company / Workspace Name
                        </Label>
                        <div className="relative">
                            <Input
                                id="companyName"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g. Acme Corp, Ribo Tech, My Design Studio"
                            />
                        </div>
                        <InputError message={errors.companyName} />
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
                >
                    Create workspace
                </AuthButton>

                <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your workspace will be created and you'll be redirected to your dashboard
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
