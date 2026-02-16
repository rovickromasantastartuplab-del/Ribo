import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ReportFilters({ filters = {}, additionalFilters, onFilter }) {
    const { t } = useTranslation();
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        if (onFilter) {
            onFilter({ dateFrom, dateTo });
        } else {
            toast.info(t('Filters applied: {{from}} to {{to}} (Simulated)', { from: dateFrom, to: dateTo }));
        }
    };

    const handleClearFilters = () => {
        const defaultDateFrom = new Date();
        defaultDateFrom.setMonth(defaultDateFrom.getMonth() - 1);
        const defaultDateTo = new Date();

        setDateFrom(defaultDateFrom.toISOString().split('T')[0]);
        setDateTo(defaultDateTo.toISOString().split('T')[0]);

        if (onFilter) {
            onFilter({ dateFrom: '', dateTo: '' });
        }
        toast.success(t('Filters cleared!'));
    };

    return (
        <Card className="mb-6 p-4">
            <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
                <div className="min-w-[200px] flex-1">
                    <Label htmlFor="date_from">{t('From Date')}</Label>
                    <Input
                        id="date_from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div className="min-w-[200px] flex-1">
                    <Label htmlFor="date_to">{t('To Date')}</Label>
                    <Input
                        id="date_to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
                {additionalFilters}
                <div className="flex gap-2">
                    <Button type="submit">{t('Apply Filters')}</Button>
                    <Button type="button" variant="outline" onClick={handleClearFilters}>{t('Clear Filters')}</Button>
                </div>
            </form>
        </Card>
    );
}
