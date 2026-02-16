import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Send, Trash2, Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockLandingPageData } from '@/mockData/mockLandingPageData';
import { formatDateTime } from '@/lib/utils';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function NewslettersIndex() {
    const { t } = useTranslation();

    // State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [fromItem, setFromItem] = useState(0);
    const [toItem, setToItem] = useState(0);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentNewsletter, setCurrentNewsletter] = useState(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm
            };
            const response = await axios.get('/api/newsletters', { params });
            const responseData = response.data;
            const items = responseData.data || [];

            setData(Array.isArray(items) ? items : []);
            setTotalItems(responseData.total || 0);
            setTotalPages(responseData.last_page || 1);
            setFromItem(responseData.from || 0);
            setToItem(responseData.to || 0);
        } catch (error) {
            console.error("Failed to fetch newsletters", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, searchTerm]);

    const handleDelete = (newsletter) => {
        setCurrentNewsletter(newsletter);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            toast.loading(t('Deleting newsletter subscription...'));
            await axios.delete(`/api/newsletters/${currentNewsletter.id}`);
            toast.success(t('Subscription deleted successfully'));
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('Failed to delete subscription'));
        } finally {
            toast.dismiss();
        }
    };

    const columns = [
        {
            key: 'email',
            label: t('Email'),
            render: (value) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
                </div>
            )
        },
        {
            key: 'created_at',
            label: t('Subscribed At'),
            render: (value) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : '-'
        }
    ];

    return (
        <PageTemplate
            title={t("Newsletters")}
            url="/newsletters"
            breadcrumbs={[{ title: t('Dashboard'), href: '/' }, { title: t('Landing Page'), href: '#' }, { title: t('Newsletters') }]}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={(e) => { e.preventDefault(); setCurrentPage(1); fetchData(); }}
                    filters={[]}
                    showFilters={false}
                    setShowFilters={() => { }}
                    hasActiveFilters={() => !!searchTerm}
                    onResetFilters={() => setSearchTerm('')}
                    onApplyFilters={() => { setCurrentPage(1); fetchData(); }}
                    showViewToggle={false}
                    activeView="list"
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                {columns.map((column) => (
                                    <th key={column.key} className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider">
                                        {column.label}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                                    {t("Actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((newsletter) => (
                                <tr key={newsletter.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {columns.map((column) => (
                                        <td key={`${newsletter.id}-${column.key}`} className="px-4 py-3">
                                            {column.render ? column.render(newsletter[column.key], newsletter) : newsletter[column.key]}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(newsletter)}><Trash2 className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t("Delete")}</TooltipContent>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Mail className="h-12 w-12 text-gray-300 mb-4" />
                                            <div className="text-lg font-medium mb-1">{t('No newsletter subscriptions')}</div>
                                            <p>{t('Subscribers from your landing page will appear here.')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination from={fromItem} to={toItem} total={totalItems} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
            </div>

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} itemName={currentNewsletter?.email || ''} entityName={t('newsletter subscription')} />
        </PageTemplate>
    );
}
