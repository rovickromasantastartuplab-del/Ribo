import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, Eye, Edit, Trash2, Download, Copy, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { mockInvoices, mockProducts } from '@/data/mockCrmData';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function InvoicesIndex() {
    const { t } = useTranslation();

    // Mock dependencies
    const invoices = { data: mockInvoices, total: mockInvoices.length, from: 1, to: mockInvoices.length };
    const products = mockProducts;
    const auth = { permissions: ['view-invoices', 'create-invoices', 'edit-invoices', 'delete-invoices', 'export-invoices', 'toggle-status-invoices'] };
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
                toast.success(t('Invoice link copied to clipboard! (Simulated)'));
                break;
            case 'toggle-status':
                toast.success(t('Status updated successfully (Simulated)'));
                break;
            default:
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        toast.success(t('Invoice processing simulated'));
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        toast.success(t('Invoice deleted successfully (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Invoices') }
    ];

    const columns = [
        {
            key: 'invoice_number',
            label: t('Invoice Number'),
            sortable: true,
            render: (value, item) => (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">
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
            render: (value) => {
                const colors = {
                    draft: 'bg-gray-50 text-gray-700 ring-gray-600/20',
                    sent: 'bg-blue-50 text-blue-700 ring-blue-600/20',
                    paid: 'bg-green-50 text-green-700 ring-green-600/20'
                };
                return (
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[value] || colors.draft}`}>
                        {t(value.charAt(0).toUpperCase() + value.slice(1))}
                    </span>
                );
            }
        },
        {
            key: 'due_date',
            label: t('Due Date'),
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
            title={t("Invoices")}
            url="/invoices"
            actions={[
                { label: t('Add Invoice'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                    data={invoices.data}
                    from={1}
                    onAction={handleAction}
                />
                <Pagination total={invoices.total} from={1} to={invoices.total} />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'invoice_date', label: t('Invoice Date'), type: 'date', required: true },
                        { name: 'due_date', label: t('Due Date'), type: 'date', required: true },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'draft', label: t('Draft') },
                                { value: 'sent', label: t('Sent') },
                                { value: 'paid', label: t('Paid') }
                            ]
                        },
                        { name: 'assigned_to', label: t('Assign To'), type: 'multi-select', options: [{ value: 1, label: 'Admin User' }, { value: 2, label: 'Support User' }] }
                    ]
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Invoice') : t('Edit Invoice')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.invoice_number || ''}
            />
        </PageTemplate>
    );
}
