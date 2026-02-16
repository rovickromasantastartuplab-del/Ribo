import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockReceiptOrders, mockProducts } from '@/data/mockCrmData';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ReceiptOrdersIndex() {
    const { t } = useTranslation();

    const [data, setData] = useState(mockReceiptOrders);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Receipt Orders') }
    ];

    const columns = [
        {
            key: 'order_number',
            label: t('Order Number'),
            render: (v) => (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {v}
                </span>
            )
        },
        { key: 'name', label: t('Name') },
        { key: 'vendor', label: t('Vendor') },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
        {
            key: 'status',
            label: t('Status'),
            render: (v) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${v === 'received' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20'}`}>
                    {t(v.charAt(0).toUpperCase() + v.slice(1))}
                </span>
            )
        },
        { key: 'order_date', label: t('Order Date'), render: (v) => formatDateTime(v) }
    ];

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        toast.info(t('Search is simulated'));
    };

    return (
        <PageTemplate
            title={t("Receipt Orders")}
            url="/receipt-orders"
            actions={[
                { label: t('Add Order'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setFormMode('create'); setIsFormModalOpen(true); } }
            ]}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: setSelectedStatus,
                            options: [
                                { value: 'all', label: t('All Statuses') },
                                { value: 'pending', label: t('Pending') },
                                { value: 'received', label: t('Received') },
                                { value: 'cancelled', label: t('Cancelled') }
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => selectedStatus !== 'all' || searchTerm !== ''}
                    onResetFilters={() => { setSearchTerm(''); setSelectedStatus('all'); setShowFilters(false); }}
                />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={[
                        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
                        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
                        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
                    ]}
                    data={data}
                    from={1}
                    onAction={(action, item) => {
                        setCurrentItem(item);
                        if (action === 'delete') setIsDeleteModalOpen(true);
                        else { setFormMode(action); setIsFormModalOpen(true); }
                    }}
                />
                <Pagination total={data.length} from={1} to={data.length} />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={() => { toast.success(t('Receipt processing simulated')); setIsFormModalOpen(false); }}
                formConfig={{
                    fields: [
                        { name: 'warehouse', label: t('Warehouse'), type: 'text', required: true },
                        { name: 'received_date', label: t('Received Date'), type: 'date', required: true },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'Support User' }] }
                    ]
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Receipt') : t('Edit Receipt')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { toast.success(t('Receipt order deleted (Simulated)')); setIsDeleteModalOpen(false); }}
                itemName={currentItem?.order_number || ''}
            />
        </PageTemplate>
    );
}
