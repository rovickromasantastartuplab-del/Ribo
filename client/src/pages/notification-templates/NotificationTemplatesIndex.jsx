import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Bell, MoreHorizontal } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Mock Data
const mockTemplates = [
    { id: 1, name: 'Lead Assignment Notification', created_at: '2024-01-20T10:00:00Z' },
    { id: 2, name: 'Meeting Reminder', created_at: '2024-01-22T14:30:00Z' },
    { id: 3, name: 'Case Resolved', created_at: '2024-01-25T09:15:00Z' },
    { id: 4, name: 'New Sales Order Created', created_at: '2024-01-30T16:00:00Z' },
];

export default function NotificationTemplatesIndex() {
    const { t } = useTranslation();

    // State
    const [data, setData] = useState(mockTemplates);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        toast.info(t('Search is simulated'));
    };

    const handleAction = (action, item) => {
        if (action === 'view') {
            toast.info(t('View template detail (Simulated)'));
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Notification Templates') }
    ];

    return (
        <PageTemplate
            title={t("Notification Templates")}
            url="/notification-templates"
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[]}
                    showFilters={false}
                    setShowFilters={() => { }}
                    hasActiveFilters={() => false}
                    activeFilterCount={() => 0}
                    onResetFilters={() => { }}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <TooltipProvider>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('Name')}</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">{t('Created At')}</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((template) => (
                                <tr key={template.id} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                <Bell className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{template.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(template.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleAction('view', template)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t('View')}</TooltipContent>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TooltipProvider>
                <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("notification templates")} />
            </div>
        </PageTemplate>
    );
}
