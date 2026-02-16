import { Card } from '@/components/ui/card';

export function SummaryCard({ title, value, icon, iconColor, valueColor = 'text-gray-900' }) {
    return (
        <Card className="p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-xl ${iconColor}`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
                </div>
            </div>
        </Card>
    );
}

export function SummaryCards({ cards }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
                <SummaryCard key={index} {...card} />
            ))}
        </div>
    );
}
