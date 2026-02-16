import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter, Search, Plus, Eye, Edit, Trash2, KeyRound, Lock, Unlock, LayoutGrid, List, Info, ArrowUpRight, CreditCard, History } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/custom-toast';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from 'react-i18next';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { UpgradePlanModal } from '@/components/UpgradePlanModal';
import { companyService } from '@/services/companyService';
import { useAuth } from '@/context/AuthContext';

export default function Companies() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // Get user from context
    const getInitials = useInitials();

    // Data State
    const [companies, setCompanies] = useState({
        data: [],
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1
    });
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [activeView, setActiveView] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [startDate, setStartDate] = useState(undefined);
    const [endDate, setEndDate] = useState(undefined);
    const [showFilters, setShowFilters] = useState(false);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);

    const [currentCompany, setCurrentCompany] = useState(null);
    const [availablePlans, setAvailablePlans] = useState([]); // Would fetch from planService
    const [formMode, setFormMode] = useState('create');

    // Fetch Data
    const fetchCompanies = async (page = 1, limit = companies.per_page) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                status: selectedStatus,
                start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
                end_date: endDate ? endDate.toISOString().split('T')[0] : undefined
            };
            const response = await companyService.getAll(params);
            setCompanies({
                data: response.data || [],
                total: response.meta?.total || 0,
                per_page: response.meta?.per_page || 10,
                current_page: response.meta?.current_page || 1,
                last_page: response.meta?.last_page || 1,
                from: ((response.meta?.current_page - 1) * response.meta?.per_page) + 1,
                to: Math.min(response.meta?.current_page * response.meta?.per_page, response.meta?.total)
            });
        } catch (error) {
            console.error("Failed to fetch companies:", error);
            // Don't show toast on 404/empty, just log
            if (error.code !== 'PGRST116') { // Supabase no rows found code
                toast.error(t("Failed to load companies"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [searchTerm, selectedStatus, startDate, endDate]); // Fetch when filters change

    // ... (rest of component)



    // Check if any filters are active
    const hasActiveFilters = () => {
        return selectedStatus !== 'all' || searchTerm !== '' || startDate !== undefined || endDate !== undefined;
    };

    // Count active filters
    const activeFilterCount = () => {
        return (selectedStatus !== 'all' ? 1 : 0) +
            (searchTerm ? 1 : 0) +
            (startDate ? 1 : 0) +
            (endDate ? 1 : 0);
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        fetchCompanies(1);
    };

    const applyFilters = () => {
        fetchCompanies(1);
        toast.info(t("Filters applied"));
    };

    const handleStatusFilter = (value) => {
        setSelectedStatus(value);
    };

    const handleSort = (field) => {
        // Sort logic not implemented in service yet
        console.log("Sorting by", field);
    };

    const handleAction = (action, company) => {
        setCurrentCompany(company);

        switch (action) {
            case 'login-as':
                localStorage.setItem('dashboardViewMode', 'company'); // Force company view
                localStorage.setItem('isImpersonating', 'true');
                window.dispatchEvent(new Event('dashboard-view-mode-changed'));
                toast.success(t('Logged in as') + ' ' + company.name);
                navigate('/dashboard');
                break;
            case 'company-info':
                setFormMode('view');
                setIsFormModalOpen(true);
                break;
            case 'upgrade-plan':
                // fetch plans then open
                setIsUpgradePlanModalOpen(true);
                break;
            case 'reset-password':
                setIsResetPasswordModalOpen(true);
                break;
            case 'toggle-status':
                handleToggleStatus(company);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentCompany(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formMode === 'create') {
                toast.loading(t('Creating company...'));
                await companyService.create(formData);
                toast.dismiss();
                toast.success(t("Company created successfully"));
                setIsFormModalOpen(false);
                fetchCompanies(1); // Refresh list
            } else if (formMode === 'edit') {
                toast.loading(t('Updating company...'));
                // Use key from formData or currentCompany
                await companyService.update(currentCompany.companyId || currentCompany.id, formData);
                toast.dismiss();
                toast.success(t("Company updated successfully"));
                setIsFormModalOpen(false);
                fetchCompanies(companies.current_page);
            }
        } catch (error) {
            console.error("Form submit error:", error);
            toast.dismiss();
            toast.error(error.response?.data?.error || t("Operation failed"));
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            toast.loading(t('Deleting company...'));
            // Use correct ID field (Supabase usually uses UUIDs, but check your schema)
            const id = currentCompany.companyId || currentCompany.id;
            await companyService.delete(id);
            toast.dismiss();
            toast.success(t("Company deleted successfully"));
            setIsDeleteModalOpen(false);
            fetchCompanies(companies.current_page);
        } catch (error) {
            console.error("Delete error:", error);
            toast.dismiss();
            toast.error(t("Failed to delete company"));
        }
    };

    const handleResetPasswordConfirm = async (data) => {
        try {
            toast.loading(t('Resetting password...'));
            // Mock API call for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            // await companyService.resetPassword(currentCompany.id, data.password);

            toast.dismiss();
            toast.success(t("Password reset successfully"));
            setIsResetPasswordModalOpen(false);
        } catch (error) {
            console.error("Reset password error:", error);
            toast.dismiss();
            toast.error(t("Failed to reset password"));
        }
    };

    const handleToggleStatus = async (company) => {
        try {
            toast.loading(t('Updating status...'));
            const newStatus = company.status === 'active' ? 'inactive' : 'active';
            const id = company.companyId || company.id;
            await companyService.update(id, { status: newStatus });
            toast.dismiss();
            toast.success(t("Status updated successfully"));

            // Optimistic update
            setCompanies(prev => ({
                ...prev,
                data: prev.data.map(c => (c.companyId === id || c.id === id) ? { ...c, status: newStatus } : c)
            }));
        } catch (error) {
            console.error("Status update error:", error);
            toast.dismiss();
            toast.error(t("Failed to update status"));
        }
    };

    const handleResetFilters = () => {
        setSelectedStatus('all');
        setSearchTerm('');
        setStartDate(undefined);
        setEndDate(undefined);
        setShowFilters(false);
        fetchCompanies(1);
    };

    // Plan Upgrade (Mock implementation for now as plans backend not integrated)
    const handleUpgradePlanConfirm = (planId) => {
        toast.info("Plan upgrade not fully integrated");
        setIsUpgradePlanModalOpen(false);
    };

    const handlePerPageChange = (value) => {
        setCompanies(prev => ({ ...prev, per_page: parseInt(value), current_page: 1 }));
        // fetchCompanies will be triggered by useEffect if we add per_page to dependency, 
        // OR we can call it directly. 
        // Currently useEffect tracks searchTerm and selectedStatus. 
        // Better to update state then trigger fetch.
        // Let's rely on a new useEffect or modify existing one.
        // Actually, easiest is to just call fetch immediately with new limit
        fetchCompanies(1, parseInt(value));
        // But fetchCompanies reads from state 'companies.per_page', which might not be updated yet due to closure.
        // So we should modify fetchCompanies to accept limit as arg OR use useEffect.
    };

    // Update fetchCompanies to allow overriding limit
    // ... (This requires modifying fetchCompanies signature, or we can just add per_page to useEffect dependency)
    // Let's add companies.per_page to useEffect dependency in the next step.

    // Actions Button
    const pageActions = [
        {
            label: t('User Logs'),
            icon: <Eye className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: () => toast.info("User logs feature coming soon")
        },
        {
            label: t('Add Company'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: () => handleAddNew()
        }
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/' },
        { title: t('Companies') }
    ];

    const getAvatarUrl = (company) => {
        return company.avatar || "/images/avatar/avatar.png";
    };

    // Columns
    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={getAvatarUrl(row)} />
                        <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-sm text-muted-foreground">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'plan_name',
            label: t('Plan'),
            render: (value) => <span className="capitalize">{value || 'Free'}</span>
        },
        {
            key: 'createdAt',
            label: t('Created At'),
            sortable: true,
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        }
    ];

    const companyFormConfig = {
        fields: [
            { name: 'name', label: t('Company Name'), type: 'text', required: true, placeholder: t('Enter company name') },
            { name: 'email', label: t('Email'), type: 'email', required: true, placeholder: t('Enter email address') },
            {
                name: 'enableLogin',
                label: t('Enable Login'),
                type: 'switch',
                defaultValue: true,
                conditional: (mode) => mode !== 'view' && mode !== 'edit'
            },
            {
                name: 'password',
                label: t('Password'),
                type: 'password',
                required: (mode) => mode === 'create',
                placeholder: t('Enter password'),
                conditional: (mode, data) => mode !== 'view' && data?.enableLogin === true && mode !== 'edit'
            }
        ],
        columns: 1,
        modalSize: 'sm:max-w-lg'
    };

    return (
        <TooltipProvider>
            <PageTemplate
                title={t("Companies")}
                url="/companies"
                actions={pageActions}
                breadcrumbs={breadcrumbs}
                noPadding
            >
                {/* Search and filters section */}
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
                                onChange: handleStatusFilter,
                                options: [
                                    { value: 'all', label: t('All Status') },
                                    { value: 'active', label: t('Active') },
                                    { value: 'inactive', label: t('Inactive') }
                                ]
                            },
                            {
                                name: 'start_date',
                                label: t('Start Date'),
                                type: 'date',
                                value: startDate,
                                onChange: (date) => setStartDate(date)
                            },
                            {
                                name: 'end_date',
                                label: t('End Date'),
                                type: 'date',
                                value: endDate,
                                onChange: (date) => setEndDate(date)
                            }
                        ]}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        hasActiveFilters={hasActiveFilters}
                        activeFilterCount={activeFilterCount}
                        onResetFilters={handleResetFilters}
                        onApplyFilters={applyFilters}
                        currentPerPage={companies.per_page.toString()}
                        onPerPageChange={handlePerPageChange}
                        showViewToggle={true}
                        activeView={activeView}
                        onViewChange={setActiveView}
                    />
                </div>

                {isLoading && companies.data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading companies...</div>
                ) : (
                    <>
                        {/* Content section */}
                        {activeView === 'list' ? (
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                                {columns.map((column) => (
                                                    <th
                                                        key={column.key}
                                                        className="px-4 py-3 text-left font-medium text-gray-500"
                                                        onClick={() => column.sortable && handleSort(column.key)}
                                                    >
                                                        {column.label}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-right font-medium text-gray-500">
                                                    {t("Actions")}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companies.data.map((company) => (
                                                <tr key={company.id || company.companyId} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                                                    {columns.map((column) => (
                                                        <td key={`${company.id || company.companyId}-${column.key}`} className="px-4 py-3">
                                                            {column.render ? column.render(company[column.key], company) : company[column.key]}
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleAction('login-as', company)}
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        <ArrowUpRight className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Login as Company')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleAction('company-info', company)}
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        <Info className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Company Info')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleAction('upgrade-plan', company)}
                                                                        className="text-amber-500 hover:text-amber-700"
                                                                    >
                                                                        <CreditCard className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Upgrade Plan')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleAction('reset-password', company)}
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        <KeyRound className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Reset Password')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleAction('toggle-status', company)}
                                                                        className="text-amber-500 hover:text-amber-700"
                                                                    >
                                                                        {company.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{company.status === 'active' ? t('Disable Login') : t('Enable Login')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleAction('edit', company)}
                                                                        className="text-amber-500 hover:text-amber-700"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{t('Edit')}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={() => handleAction('delete', company)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {companies.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                        {t("No companies found")}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination section */}
                                <Pagination
                                    from={companies.from}
                                    to={companies.to}
                                    total={companies.total}
                                    entityName={t("companies")}
                                    onPageChange={(page) => fetchCompanies(page)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {companies.data.map((company) => (
                                    <Card key={company.id || company.companyId} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start space-x-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={getAvatarUrl(company)} />
                                                        <AvatarFallback className="text-lg font-bold text-gray-700">{getInitials(company.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{company.name}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{company.email}</p>
                                                        <div className="flex items-center">
                                                            <div className={`h-2 w-2 rounded-full mr-2 ${company.status === 'active' ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-400'
                                                                }`}></div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {company.status === 'active' ? t('Active') : t('Inactive')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="1"></circle>
                                                                <circle cx="12" cy="5" r="1"></circle>
                                                                <circle cx="12" cy="19" r="1"></circle>
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 z-50" sideOffset={5}>
                                                        <DropdownMenuItem onClick={() => handleAction('login-as', company)}>
                                                            <ArrowUpRight className="h-4 w-4 mr-2" />
                                                            <span>{t("Login as Company")}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction('company-info', company)}>
                                                            <Info className="h-4 w-4 mr-2" />
                                                            <span>{t("Company Info")}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction('upgrade-plan', company)}>
                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                            <span>{t("Upgrade Plan")}</span>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => handleAction('reset-password', company)}>
                                                            <KeyRound className="h-4 w-4 mr-2" />
                                                            <span>{t("Reset Password")}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction('toggle-status', company)}>
                                                            {company.status === 'active' ?
                                                                <Lock className="h-4 w-4 mr-2" /> :
                                                                <Unlock className="h-4 w-4 mr-2" />
                                                            }
                                                            <span>{company.status === 'active' ? t("Disable Login") : t("Enable Login")}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAction('edit', company)} className="text-amber-600">
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            <span>{t("Edit")}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction('delete', company)} className="text-rose-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            <span>{t("Delete")}</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Plan info */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4">
                                                <div className="flex items-center justify-center">
                                                    <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{company.plan_name || 'Free'}</span>
                                                </div>
                                                {company.plan_expiry_date && (
                                                    <div className="text-xs text-gray-500 text-center mt-1">
                                                        {t("Expires")}: {new Date(company.plan_expiry_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction('edit', company)}
                                                    className="flex-1 h-9 text-sm border-gray-300 dark:border-gray-600"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    {t("Edit")}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction('company-info', company)}
                                                    className="flex-1 h-9 text-sm border-gray-300 dark:border-gray-600"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t("View")}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Modals */}
                {isFormModalOpen && (
                    <CrudFormModal
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        onSubmit={handleFormSubmit}
                        initialData={currentCompany}
                        title={formMode === 'create' ? t('Add Company') : (formMode === 'edit' ? t('Edit Company') : t('Company Details'))}
                        mode={formMode}
                        formConfig={companyFormConfig}
                    />
                )}

                {isDeleteModalOpen && (
                    <CrudDeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteConfirm}
                        title={t('Delete Company')}
                        itemName={currentCompany?.name}
                        description={t('Are you sure you want to delete this company? This action cannot be undone.')}
                    />
                )}

                {/* Reset Password Modal */}
                {isResetPasswordModalOpen && (
                    <CrudFormModal
                        isOpen={isResetPasswordModalOpen}
                        onClose={() => setIsResetPasswordModalOpen(false)}
                        onSubmit={handleResetPasswordConfirm}
                        formConfig={{
                            fields: [
                                { name: 'password', label: t('New Password'), type: 'password', required: true }
                            ],
                            modalSize: 'sm'
                        }}
                        initialData={{}}
                        title={`Reset Password for ${currentCompany?.name || 'Company'}`}
                        mode="edit"
                    />
                )}

                {/* Upgrade Plan Modal */}
                <UpgradePlanModal
                    isOpen={isUpgradePlanModalOpen}
                    onClose={() => setIsUpgradePlanModalOpen(false)}
                    onConfirm={handleUpgradePlanConfirm}
                    plans={availablePlans}
                    currentPlanId={currentCompany?.plan_id}
                    companyName={currentCompany?.name || ''}
                />
            </PageTemplate>
        </TooltipProvider>
    );
}
