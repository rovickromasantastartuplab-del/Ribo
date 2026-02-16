import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Calendar, DollarSign, Target, Lock } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock Data
const mockCampaigns = [
    {
        id: 1,
        name: 'Summer SaaS Blast',
        campaign_type: { name: 'Email Marketing' },
        target_list: { name: 'SaaS Decision Makers' },
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        budget: 5000,
        actual_cost: 1200,
        assigned_user: { name: 'John Doe' },
        status: 'active',
        created_at: '2024-01-20T10:00:00Z'
    },
    {
        id: 2,
        name: 'Europe Expansion Q2',
        campaign_type: { name: 'Social Media' },
        target_list: { name: 'Dormant Leads' },
        start_date: '2024-04-01',
        end_date: '2024-06-30',
        budget: 10000,
        actual_cost: 0,
        assigned_user: { name: 'Jane Smith' },
        status: 'active',
        created_at: '2024-01-22T14:30:00Z'
    },
];

export default function CampaignsIndex() {
    const { t } = useTranslation();
    const permissions = ['view-campaigns', 'create-campaigns', 'edit-campaigns', 'delete-campaigns', 'toggle-status-campaigns'];

    // State
    const [data, setData] = useState(mockCampaigns);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formMode, setFormMode] = useState('create');
    const [activeView, setActiveView] = useState('list');

    const hasActiveFilters = () => searchTerm !== '' || selectedType !== 'all' || selectedStatus !== 'all';
    const activeFilterCount = () => (searchTerm ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

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
            case 'toggle-status':
                toast.success(t('Status updated successfully! (Simulated)'));
                setData(prev => prev.map(c => c.id === item.id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
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
        if (formMode === 'create') {
            const newItem = {
                ...formData,
                id: data.length + 1,
                created_at: new Date().toISOString(),
                status: formData.status || 'active',
                campaign_type: { name: 'Custom' },
                target_list: { name: 'All' },
                assigned_user: { name: 'Admin' }
            };
            setData([newItem, ...data]);
            toast.success(t('Campaign created successfully! (Simulated)'));
        } else {
            setData(data.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
            toast.success(t('Campaign updated successfully! (Simulated)'));
        }
        setIsFormModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setData(data.filter(c => c.id !== currentItem.id));
        toast.success(t('Campaign deleted successfully! (Simulated)'));
        setIsDeleteModalOpen(false);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedStatus('all');
        setShowFilters(false);
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Campaign Management') },
        { title: t('Campaigns') }
    ];

    const formatCurrency = (val) => `$${parseFloat(val || 0).toLocaleString()}`;

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (v, row) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.campaign_type?.name}</div>
                </div>
            )
        },
        { key: 'start_date', label: t('Start Date'), sortable: true },
        { key: 'end_date', label: t('End Date'), sortable: true },
        { key: 'budget', label: t('Budget'), render: (v) => formatCurrency(v) },
        { key: 'actual_cost', label: t('Actual Cost'), render: (v) => formatCurrency(v) },
        {
            key: 'status',
            label: t('Status'),
            render: (value) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${value === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {value === 'active' ? t('Active') : t('Inactive')}
                </span>
            )
        }
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
        { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
    ];

    return (
        <PageTemplate
            title={t("Campaigns")}
            url="/campaigns"
            actions={[
                { label: t('Add Campaign'), icon: <Plus className="h-4 w-4 mr-2" />, onClick: handleAddNew }
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
                                { value: 'all', label: t('All Status') },
                                { value: 'active', label: t('Active') },
                                { value: 'inactive', label: t('Inactive') }
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    showViewToggle
                    activeView={activeView}
                    onViewChange={setActiveView}
                />
            </div>

            {activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable
                        columns={columns}
                        actions={actions}
                        data={data}
                        from={1}
                        onAction={handleAction}
                        permissions={permissions}
                    />
                    <Pagination from={1} to={data.length} total={data.length} links={[]} entityName={t("campaigns")} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((campaign) => (
                        <Card key={campaign.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{campaign.name}</h3>
                                        <p className="text-xs text-gray-500">{campaign.campaign_type?.name}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction('view', campaign)}><Eye className="h-4 w-4 mr-2" />{t("View")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('edit', campaign)} className="text-amber-600"><Edit className="h-4 w-4 mr-2" />{t("Edit")}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', campaign)} className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" />{t("Delete")}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 mr-2" />
                                        {campaign.start_date} - {campaign.end_date}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <DollarSign className="h-3.5 w-3.5 mr-2" />
                                        {t('Budget')}: {formatCurrency(campaign.budget)}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Target className="h-3.5 w-3.5 mr-2" />
                                        {campaign.target_list?.name}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t">
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${campaign.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {campaign.status === 'active' ? t('Active') : t('Inactive')}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('edit', campaign)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAction('view', campaign)}><Eye className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Campaign Name'), type: 'text', required: true },
                        { name: 'start_date', label: t('Start Date'), type: 'date', required: true },
                        { name: 'end_date', label: t('End Date'), type: 'date', required: true },
                        { name: 'budget', label: t('Budget'), type: 'number' },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'status', label: t('Status'), type: 'select', options: [{ value: 'active', label: t('Active') }, { value: 'inactive', label: t('Inactive') }], defaultValue: 'active' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Campaign') : formMode === 'edit' ? t('Edit Campaign') : t('View Campaign')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('campaign')}
            />
        </PageTemplate>
    );
}
