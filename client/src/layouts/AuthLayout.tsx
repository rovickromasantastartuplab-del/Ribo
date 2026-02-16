import React from 'react';
import { ReactNode, useEffect, useState } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { useAppearance, THEME_COLORS } from '@/hooks/use-appearance';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    icon?: ReactNode;
    status?: string;
    statusType?: 'success' | 'error';
}

export default function AuthLayout({
    children,
    title,
    description,
    icon,
    status,
    statusType = 'success',
}: AuthLayoutProps) {
    const [mounted, setMounted] = useState(false);
    const { logoLight, logoDark, themeColor, customColor } = useBrand();
    const { appearance } = useAppearance();

    const currentLogo = appearance === 'dark' ? logoLight : logoDark;
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];

    useEffect(() => {
        setMounted(true);
        // Set page title
        document.title = title;
    }, [title]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            {/* Enhanced Background Design */}
            <div className="absolute inset-0">
                {/* Elegant Pattern Overlay */}
                <div className="absolute inset-0 opacity-70" style={{
                    backgroundImage: `radial-gradient(circle at 30% 70%, ${primaryColor} 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}></div>
            </div>

            <div className="flex items-center justify-center min-h-screen p-6">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="relative lg:inline-block pb-2 lg:px-6">
                            {currentLogo ? (
                                <img src={currentLogo} alt="Logo" className="w-auto mx-auto h-12" />
                            ) : (
                                <div className="text-3xl font-bold" style={{ color: primaryColor }}>
                                    Ribo
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="relative">
                        {/* Corner accents */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 rounded-tl-md" style={{ borderColor: primaryColor }}></div>
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 rounded-br-md" style={{ borderColor: primaryColor }}></div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg lg:p-8 p-4 lg:pt-5 shadow-sm">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h1 className="sm:text-2xl text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1.5 tracking-wide">{title}</h1>
                                <div className="w-12 h-px mx-auto mb-2.5" style={{ backgroundColor: primaryColor }}></div>
                                {description && (
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{description}</p>
                                )}
                            </div>

                            {status && (
                                <div className={`mb-6 text-center text-sm font-medium ${statusType === 'success'
                                    ? 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
                                    : 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
                                    } p-3 rounded-lg border`}>
                                    {status}
                                </div>
                            )}

                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <div className="lg:px-9 lg:relative lg:inline-flex">
                            <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-md px-4 py-2 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Ribo CRM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
