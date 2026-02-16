import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockQuotes, mockProducts } from '@/data/mockCrmData';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function QuotesIndex() {
    const { t } = useTranslation();

    // Mock dependencies
    const quotes = { data: mockQuotes, total: mockQuotes.length, from: 1, to: mockQuotes.length };
    const auth = { permissions: ['view-quotes', 'create-quotes', 'edit-quotes', 'delete-quotes', 'export-quotes'] };
    const permissions = auth.permissions;

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        toast.info(t('Search is simulated'));
    };

    const handleAction = (action, item) => {
        setCurrentItem(item);
        switch (action) {
            case 'view':
                setFormMode('view');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'copy-link':
                toast.success(t('Quote link copied to clipboard! (Simulated)'));
                break;
            default:
                break;
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Quotes') }
    ];

    const columns = [
        {
            key: 'quote_number',
            label: t('Quote Number'),
            sortable: true,
            render: (value) => (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {value}
                </span>
            )
        },
        { key: 'name', label: t('Name'), sortable: true },
        { key: 'account', label: t('Account'), render: (v) => v?.name || t('-') },
        { key: 'assigned_users', label: t('Assigned To'), render: (v) => Array.isArray(v) && v.length > 0 ? v.map(u => u.name).join(', ') : t('Unassigned') },
        {
            key: 'total_amount',
            label: t('Total Amount'),
            render: (v) => formatCurrency(Number(v || 0))
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'accepted' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
                    {t(value.charAt(0).toUpperCase() + value.slice(1))}
                </span>
            )
        },
        {
            key: 'valid_until',
            label: t('Valid Until'),
            render: (v) => formatDateTime(v)
        }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Copy Link'), icon: 'Copy', action: 'copy-link', className: 'text-purple-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Quotes")}
            url="/quotes"
            actions={[
                { label: t('Add Quote'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: () => { setFormMode('create'); setIsFormModalOpen(true); } }
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
                                { value: 'draft', label: t('Draft') },
                                { value: 'sent', label: t('Sent') },
                                { value: 'paid', label: t('Paid') }
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
                    actions={actions}
                    data={quotes.data}
                    from={1}
                    onAction={handleAction}
                />
                <Pagination total={quotes.total} from={1} to={quotes.total} />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={() => { toast.success(t('Quote processing simulated')); setIsFormModalOpen(false); }}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'quote_date', label: t('Quote Date'), type: 'date', required: true },
                        { name: 'valid_until', label: t('Valid Until'), type: 'date', required: true },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'draft', label: t('Draft') },
                                { value: 'sent', label: t('Sent') },
                                { value: 'accepted', label: t('Accepted') }
                            ]
                        },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'Support User' }] }
                    ]
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Quote') : t('Edit Quote')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { toast.success(t('Quote deleted (Simulated)')); setIsDeleteModalOpen(false); }}
                itemName={currentItem?.quote_number || ''}
            />
        </PageTemplate>
    );
}
