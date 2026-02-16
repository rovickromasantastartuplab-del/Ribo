import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export function ConvertLeadModal({ isOpen, onClose, onConfirm, lead, type }) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(lead, type);
        } catch (error) {
            console.error("Conversion failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('Convert Lead to')} {type === 'account' ? t('Account') : t('Contact')}</DialogTitle>
                    <DialogDescription>
                        {t('This action will convert the lead')} <strong>{lead?.name}</strong> {t('to a new')} {type}.
                        {t('This action cannot be undone.')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t('Name')}
                        </Label>
                        <Input
                            id="name"
                            defaultValue={lead?.name}
                            className="col-span-3"
                            disabled
                        />
                    </div>
                    {lead?.company && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="company" className="text-right">
                                {t('Company')}
                            </Label>
                            <Input
                                id="company"
                                defaultValue={lead?.company}
                                className="col-span-3"
                                disabled
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('Cancel')}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? t('Converting...') : t('Convert')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
