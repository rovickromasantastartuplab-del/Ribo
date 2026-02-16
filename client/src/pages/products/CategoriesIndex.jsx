import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Edit, Trash2, Folder, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockCategories } from '@/data/mockCrmData';
import { formatDateTime } from '@/lib/utils';

export default function CategoriesIndex() {
    const { t } = useTranslation();
    const [data, setData] = useState(mockCategories);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const columns = [
        { key: 'name', label: t('Name'), sortable: true },
        {
            key: 'status',
            label: t('Status'),
            render: (v) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${v === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'}`}>
                    {t(v.charAt(0).toUpperCase() + v.slice(1))}
                </span>
            )
        }
    ];

    return (
        <PageTemplate
            title={t("Categories")}
            url="/categories"
            actions={[{ label: t('Add Category'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setFormMode('create'); setIsFormModalOpen(true); } }]}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={[
                        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
                        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
                    ]}
                    data={data}
                    onAction={(action, item) => {
                        setCurrentItem(item);
                        if (action === 'delete') setIsDeleteModalOpen(true);
                        else { setFormMode(action); setIsFormModalOpen(true); }
                    }}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={() => { toast.success(t('Category update simulated')); setIsFormModalOpen(false); }}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [{ value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }]
                        }
                    ]
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Category') : t('Edit Category')}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { toast.success(t('Category deleted (Simulated)')); setIsDeleteModalOpen(false); }}
                itemName={currentItem?.name || ''}
            />
        </PageTemplate>
    );
}
