
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function Pagination({
    from = 0,
    to = 0,
    total = 0,
    links = [],
    currentPage,
    lastPage,
    entityName = 'items',
    onPageChange,
    className = '',
}) {
    const { t } = useTranslation();

    const handlePageChange = (url) => {
        if (!url) return;

        // Extract page number from URL if possible, or just pass the URL
        if (onPageChange) {
            onPageChange(url);
        } else {
            window.location.href = url;
        }
    };

    // Helper to render pagination links mock
    const renderLinks = () => {
        if (links && links.length > 0) {
            return links.map((link, i) => {
                const isTextLink = link.label.includes('Previous') || link.label.includes('Next');
                const label = link.label.replace('&laquo; ', '').replace(' &raquo;', '');

                return (
                    <Button
                        key={`pagination-${i}`}
                        variant={link.active ? 'default' : 'outline'}
                        size={isTextLink ? "sm" : "icon"}
                        className={isTextLink ? "px-3" : "h-8 w-8"}
                        disabled={!link.url}
                        onClick={() => handlePageChange(link.url)}
                    >
                        {isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                    </Button>
                );
            });
        }

        // Fallback pagination if links structure matches simple standard
        if (!currentPage) currentPage = 1;
        if (!lastPage) lastPage = 1;

        return (
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange && onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                    Page {currentPage} of {lastPage}
                </div>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange && onPageChange(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className={cn(
            "p-4 border-t dark:border-gray-700 flex items-center justify-between dark:bg-gray-900",
            className
        )}>
            <div className="text-sm text-muted-foreground dark:text-gray-300">
                {t("Showing")} <span className="font-medium dark:text-white">{from}</span> {t("to")}{" "}
                <span className="font-medium dark:text-white">{to}</span> {t("of")}{" "}
                <span className="font-medium dark:text-white">{total}</span> {entityName}
            </div>

            <div className="flex gap-1">
                {renderLinks()}
            </div>
        </div>
    );
}
