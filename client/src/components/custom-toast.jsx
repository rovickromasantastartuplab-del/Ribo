import { Toaster } from '@/components/ui/sonner';
import { toast as sonnerToast } from 'sonner';

const isDemoMode = () => {
    return window.isDemo || false;
};

const demoModeMessage = 'This action is disabled in demo mode. You can only create new data, not modify existing demo data.';

// helpers to wrap fetch or router if needed, currently just exporting toast
export const toast = {
    ...sonnerToast,
    loading: (message, options) => {
        if (isDemoMode()) {
            return;
        }
        if (isDemoMode() && (message.includes('Delet') || message.includes('Updat') || message.includes('Reset') || message.includes('Modif') || message.includes('Acti') || message.includes('Deacti'))) {
            return;
        }
        return sonnerToast.loading(message, options);
    },
};

export const CustomToast = () => {
    return <Toaster position="top-right" duration={4000} richColors closeButton />;
};
