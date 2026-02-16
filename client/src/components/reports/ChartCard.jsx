import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

export function ChartCard({ title, children, actions, className = '' }) {
    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
            {children}
        </Card>
    );
}
