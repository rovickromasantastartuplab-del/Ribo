import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Eye, Edit, Trash2, FileText, Globe, CheckCircle, XCircle } from 'lucide-react';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { mockLandingPageData } from '@/mockData/mockLandingPageData';
import { formatDateTime } from '@/lib/utils';

export default function CustomPagesIndex() {
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

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [deletingPage, setDeletingPage] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        meta_title: '',
        meta_description: '',
        is_active: true,
        sort_order: 0
    });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchTerm
            };
            const response = await axios.get('/api/landing-page/custom-pages', { params });
            const responseData = response.data;
            const items = responseData.data || [];

            setData(Array.isArray(items) ? items : []);
            setTotalItems(responseData.total || 0);
            setTotalPages(responseData.last_page || 1);
            setFromItem(responseData.from || 0);
            setToItem(responseData.to || 0);
        } catch (error) {
            console.error("Failed to fetch custom pages", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            toast.loading(t('Saving page...'));
            if (editingPage) {
                await axios.put(`/api/landing-page/custom-pages/${editingPage.id}`, formData);
                toast.success(t('Page updated successfully!'));
            } else {
                await axios.post('/api/landing-page/custom-pages', formData);
                toast.success(t('Page created successfully!'));
            }
            setIsFormModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(t('Failed to save page.'));
        } finally {
            toast.dismiss();
        }
    };

    const handleEdit = (page) => {
        setFormData({
            title: page.title,
            content: page.content,
            meta_title: page.meta_title || '',
            meta_description: page.meta_description || '',
            is_active: page.is_active,
            sort_order: page.sort_order || 0
        });
        setEditingPage(page);
        setIsFormModalOpen(true);
    };

    const handleDelete = (page) => {
        setDeletingPage(page);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            toast.loading(t('Deleting page...'));
            await axios.delete(`/api/landing-page/custom-pages/${deletingPage.id}`);
            toast.success(t('Page deleted successfully!'));
            setIsDeleteModalOpen(false);
            setDeletingPage(null);
            fetchData();
        } catch (error) {
            toast.error(t('Failed to delete page.'));
        } finally {
            toast.dismiss();
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            meta_title: '',
            meta_description: '',
            is_active: true,
            sort_order: 0
        });
        setEditingPage(null);
    };

    const columns = [
        {
            key: 'title',
            label: t('Title'),
            sortable: true,
            render: (value) => <div className="font-medium text-gray-900 dark:text-white">{value}</div>
        },
        {
            key: 'content',
            label: t('Content'),
            render: (value) => (
                <div className="max-w-xs truncate text-gray-500" title={value?.replace(/<[^>]*>/g, '')}>
                    {value?.replace(/<[^>]*>/g, '').substring(0, 80)}...
                </div>
            )
        },
        {
            key: 'is_active',
            label: t('Status'),
            render: (value) => (
                <Badge className={`capitalize ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {value ? t('Active') : t('Inactive')}
                </Badge>
            )
        }
    ];

    return (
        <PageTemplate
            title={t("Custom Pages")}
            url="/landing-page/custom-pages"
            breadcrumbs={[{ title: t('Dashboard'), href: '/' }, { title: t('Landing Page'), href: '#' }, { title: t('Custom Pages') }]}
            actions={[{ label: t('Add Page'), icon: <Plus className="w-4 h-4 mr-2" />, onClick: () => { resetForm(); setIsFormModalOpen(true); } }]}
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
                <CrudTable
                    columns={columns}
                    actions={[{ label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' }, { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }]}
                    data={data}
                    from={fromItem}
                    onAction={(action, item) => action === 'edit' ? handleEdit(item) : handleDelete(item)}
                />
                <Pagination from={fromItem} to={toItem} total={totalItems} onPageChange={setCurrentPage} currentPage={currentPage} totalPages={totalPages} />
            </div>

            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingPage ? t('Edit Page') : t('Create Custom Page')}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">{t('Page Title')}</Label>
                            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t("About Us")} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">{t('Content')}</Label>
                            <RichTextEditor content={formData.content} onChange={(content) => setFormData({ ...formData, content })} placeholder={t("Page content...")} className="min-h-[300px]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">{t('Meta Title (SEO)')}</Label>
                                <Input id="meta_title" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} placeholder={t("SEO title")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">{t('Sort Order')}</Label>
                                <Input id="sort_order" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta_description">{t('Meta Description (SEO)')}</Label>
                            <Textarea id="meta_description" value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} placeholder={t("SEO description")} rows={3} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                            <Label htmlFor="is_active">{t('Active')}</Label>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>{t('Cancel')}</Button>
                            <Button type="submit">{editingPage ? t('Update Page') : t('Create Page')}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} itemName={deletingPage?.title || ''} entityName={t('page')} />
        </PageTemplate>
    );
}
