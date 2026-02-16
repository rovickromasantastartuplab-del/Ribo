import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, Mail, CheckCircle, XCircle } from 'lucide-react';
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
import axios from 'axios';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


export default function ContactMessagesIndex() {
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

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm
            };
            const response = await axios.get('/api/contact-messages', { params });
            const responseData = response.data;
            const items = responseData.data || [];

            setData(Array.isArray(items) ? items : []);
            setTotalItems(responseData.total || 0);
            setTotalPages(responseData.last_page || 1);
            setFromItem(responseData.from || 0);
            setToItem(responseData.to || 0);
        } catch (error) {
            console.error("Failed to fetch contact messages", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, searchTerm]);

    const handleView = (message) => {
        setCurrentMessage(message);
        setIsViewModalOpen(true);
    };

    const handleDelete = (message) => {
        setCurrentMessage(message);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            toast.loading(t('Deleting contact message...'));
            await axios.delete(`/api/contact-messages/${currentMessage.id}`);
            toast.success(t('Contact message deleted successfully'));
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(t('Failed to delete contact message'));
        } finally {
            toast.dismiss();
        }
    };

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            render: (value, row) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-sm text-muted-foreground">{row.email}</div>
                </div>
            )
        },
        {
            key: 'subject',
            label: t('Subject'),
            render: (value) => <span className="font-medium">{value}</span>
        },
        {
            key: 'created_at',
            label: t('Received At'),
            render: (value) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : '-'
        }
    ];

    return (
        <PageTemplate
            title={t("Contact Messages")}
            url="/contact-messages"
            breadcrumbs={[{ title: t('Dashboard'), href: '/' }, { title: t('Landing Page'), href: '#' }, { title: t('Contact Messages') }]}
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
                            {data.map((message) => (
                                <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    {columns.map((column) => (
                                        <td key={`${message.id}-${column.key}`} className="px-4 py-3">
                                            {column.render ? column.render(message[column.key], message) : message[column.key]}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => handleView(message)}><Eye className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent>{t("View")}</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(message)}><Trash2 className="h-4 w-4" /></Button>
                                                </TooltipTrigger>
                                                <TooltipContent>{t("Delete")}</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                                            <div className="text-lg font-medium mb-1">{t('No contact messages')}</div>
                                            <p>{t('Messages from your landing page will appear here.')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination from={fromItem} to={toItem} total={totalItems} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
            </div>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>{t('Contact Message Details')}</DialogTitle></DialogHeader>
                    {currentMessage && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-semibold text-gray-500 uppercase">{t('Name')}</label><p className="mt-1 text-sm font-medium">{currentMessage.name}</p></div>
                                <div><label className="text-xs font-semibold text-gray-500 uppercase">{t('Email')}</label><p className="mt-1 text-sm font-medium">{currentMessage.email}</p></div>
                            </div>
                            <div><label className="text-xs font-semibold text-gray-500 uppercase">{t('Subject')}</label><p className="mt-1 text-sm font-medium">{currentMessage.subject}</p></div>
                            <div><label className="text-xs font-semibold text-gray-500 uppercase">{t('Message')}</label><p className="mt-1 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">{currentMessage.message}</p></div>
                            <div><label className="text-xs font-semibold text-gray-500 uppercase">{t('Received')}</label><p className="mt-1 text-xs text-gray-400">{formatDistanceToNow(new Date(currentMessage.created_at), { addSuffix: true })}</p></div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} itemName={currentMessage?.subject || ''} entityName={t('contact message')} />
        </PageTemplate>
    );
}
