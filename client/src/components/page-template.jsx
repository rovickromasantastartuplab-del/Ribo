import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async'; // Using React Helmet instead of Inertia Head
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PageTemplate({
    title,
    description,
    url,
    actions,
    children,
    noPadding = false,
    breadcrumbs
}) {
    // Breadcrumbs handling would ideally integrate with a global breadcrumb state 
    // or be passed down to a layout context if needed.
    // For now, we'll just render the title and actions.
    const navigate = useNavigate();
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        const checkImpersonation = () => {
            const impersonating = localStorage.getItem('isImpersonating') === 'true';
            const viewMode = localStorage.getItem('dashboardViewMode');
            // Show return button if impersonating OR stuck in company view
            setIsImpersonating(impersonating || viewMode === 'company');
        };

        checkImpersonation();
        window.addEventListener('dashboard-view-mode-changed', checkImpersonation);
        return () => window.removeEventListener('dashboard-view-mode-changed', checkImpersonation);
    }, []);

    const handleReturnToAdmin = () => {
        localStorage.removeItem('isImpersonating');
        localStorage.setItem('dashboardViewMode', 'superadmin');
        window.dispatchEvent(new Event('dashboard-view-mode-changed'));
        navigate('/companies');
    };

    return (
        <div className="flex flex-1 flex-col h-full">
            <Helmet>
                <title>{title} - Ribo CRM</title>
            </Helmet>

            <div className="flex-none p-4 pb-0">
                {/* Header with action buttons */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {isImpersonating && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReturnToAdmin}
                                className="gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Return to Admin
                            </Button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            {description && (
                                <p className="text-muted-foreground">{description}</p>
                            )}
                        </div>
                    </div>

                    {actions && actions.length > 0 && (
                        <div className="flex items-center gap-2">
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.variant || 'outline'}
                                    size="sm"
                                    onClick={action.onClick}
                                    className={`cursor-pointer ${action.className || ''}`}
                                >
                                    {action.icon && <span className="mr-2">{action.icon}</span>}
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-auto ${noPadding ? "" : "p-4 pt-0"}`}>
                {children}
            </div>
        </div>
    );
}
