import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandProvider } from './contexts/BrandContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import CreateCompany from './pages/onboarding/CreateCompany';
import Dashboard from './pages/Dashboard';
import CompaniesIndex from './pages/companies/CompaniesIndex';
import MediaLibrary from './pages/MediaLibrary';
import OpportunitySourcesIndex from './pages/opportunities/OpportunitySourcesIndex';
import CalendarIndex from './pages/calendar/CalendarIndex';
import PlansIndex from './pages/plans/PlansIndex';
import { Toaster } from "@/components/ui/toaster"
import { HelmetProvider } from 'react-helmet-async';
import CouponsIndex from './pages/coupons/CouponsIndex';
import CurrenciesIndex from './pages/currencies/CurrenciesIndex';
import { lazy } from 'react'; // Added lazy import from react
const PlanRequestsIndex = lazy(() => import('./pages/plans/PlanRequestsIndex'));
const PlanOrdersIndex = lazy(() => import('./pages/plans/PlanOrdersIndex'));
const UsersIndex = lazy(() => import('./pages/staff/UsersIndex'));
const RolesIndex = lazy(() => import('./pages/roles/RolesIndex'));
const LeadsIndex = lazy(() => import('./pages/leads/LeadsIndex'));
const LeadsShow = lazy(() => import('./pages/leads/LeadsShow'));
const LeadStatusesIndex = lazy(() => import('./pages/leads/LeadStatusesIndex'));
const OpportunitiesIndex = lazy(() => import('./pages/opportunities/OpportunitiesIndex'));
const OpportunitiesShow = lazy(() => import('./pages/opportunities/OpportunitiesShow'));
const OpportunityStagesIndex = lazy(() => import('./pages/opportunities/OpportunityStagesIndex'));
const LeadSourcesIndex = lazy(() => import('./pages/leads/LeadSourcesIndex'));
const AccountsIndex = lazy(() => import('./pages/accounts/AccountsIndex'));
const AccountsShow = lazy(() => import('./pages/accounts/AccountsShow'));
const AccountTypesIndex = lazy(() => import('./pages/accounts/AccountTypesIndex'));
const AccountIndustriesIndex = lazy(() => import('./pages/accounts/AccountIndustriesIndex'));
const ContactsIndex = lazy(() => import('./pages/contacts/ContactsIndex'));
const ContactsShow = lazy(() => import('./pages/contacts/ContactsShow'));
const ReferralProgram = lazy(() => import('./pages/referral/ReferralProgram'));
import ReferredUsers from './pages/referral/ReferredUsers';
import LandingPageIndex from './pages/landing-page/LandingPageIndex';
import ContactMessagesIndex from './pages/landing-page/ContactMessagesIndex';
const NewslettersIndex = lazy(() => import('./pages/landing-page/NewslettersIndex'));
const CustomPagesIndex = lazy(() => import('./pages/landing-page/CustomPagesIndex'));
const ProductsIndex = lazy(() => import('./pages/products/ProductsIndex'));
const InvoicesIndex = lazy(() => import('./pages/invoices/InvoicesIndex'));
const InvoicesShow = lazy(() => import('./pages/invoices/InvoicesShow'));
const QuotesIndex = lazy(() => import('./pages/quotes/QuotesIndex'));
const QuotesShow = lazy(() => import('./pages/quotes/QuotesShow'));
const SalesOrdersIndex = lazy(() => import('./pages/orders/SalesOrdersIndex'));
const SalesOrdersShow = lazy(() => import('./pages/orders/SalesOrdersShow'));
const PurchaseOrdersIndex = lazy(() => import('./pages/orders/PurchaseOrdersIndex'));
const DeliveryOrdersIndex = lazy(() => import('./pages/orders/DeliveryOrdersIndex'));
const ReturnOrdersIndex = lazy(() => import('./pages/orders/ReturnOrdersIndex'));
const ReceiptOrdersIndex = lazy(() => import('./pages/orders/ReceiptOrdersIndex'));
const TaxesIndex = lazy(() => import('./pages/products/TaxesIndex'));
const BrandsIndex = lazy(() => import('./pages/products/BrandsIndex'));
const CategoriesIndex = lazy(() => import('./pages/products/CategoriesIndex'));
const EmailTemplatesIndex = lazy(() => import('./pages/email-templates/EmailTemplatesIndex'));
const SettingsIndex = lazy(() => import('./pages/settings/SettingsIndex'));
const FoldersIndex = lazy(() => import('./pages/document-management/FoldersIndex'));
const TypesIndex = lazy(() => import('./pages/document-management/TypesIndex'));
const DocumentsIndex = lazy(() => import('./pages/document-management/DocumentsIndex'));
const CampaignTypesIndex = lazy(() => import('./pages/campaign-management/CampaignTypesIndex'));
const TargetListsIndex = lazy(() => import('./pages/campaign-management/TargetListsIndex'));
const CampaignsIndex = lazy(() => import('./pages/campaign-management/CampaignsIndex'));
const TaskStatusesIndex = lazy(() => import('./pages/project-management/TaskStatusesIndex'));
const ProjectTasksIndex = lazy(() => import('./pages/project-management/ProjectTasksIndex'));
const ProjectsIndex = lazy(() => import('./pages/project-management/ProjectsIndex'));
const ProjectsShow = lazy(() => import('./pages/project-management/ProjectsShow'));
const CasesIndex = lazy(() => import('./pages/support-management/CasesIndex'));
const CasesShow = lazy(() => import('./pages/support-management/CasesShow'));
const MeetingsIndex = lazy(() => import('./pages/activity-management/MeetingsIndex'));
const CallsIndex = lazy(() => import('./pages/activity-management/CallsIndex'));
const LeadReports = lazy(() => import('./pages/reports/LeadReports'));
const SalesReports = lazy(() => import('./pages/reports/SalesReports'));
const ProductReports = lazy(() => import('./pages/reports/ProductReports'));
const CustomerReports = lazy(() => import('./pages/reports/CustomerReports'));
const ProjectReports = lazy(() => import('./pages/reports/ProjectReports'));
const ShippingProviderTypesIndex = lazy(() => import('./pages/shipping-provider-types/ShippingProviderTypesIndex'));
const NotificationTemplatesIndex = lazy(() => import('./pages/notification-templates/NotificationTemplatesIndex'));

import AppLayout from './layouts/AppLayout';
import { ThemeProvider } from "@/components/theme-provider"

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireOnboarding = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    // If this route requires onboarding to be complete, check it
    if (requireOnboarding) {
        // Check localStorage for onboarding completion
        const checkOnboarding = () => {
            try {
                const data = localStorage.getItem('user_company');
                return data ? JSON.parse(data).onboarding_completed : false;
            } catch {
                return false;
            }
        };

        if (!checkOnboarding()) {
            return <Navigate to="/onboarding" />;
        }
    }

    return children;
};

// Public Route Wrapper (redirects if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;

    if (user) {
        // Check localStorage for onboarding completion
        const checkOnboarding = () => {
            try {
                const data = localStorage.getItem('user_company');
                return data ? JSON.parse(data).onboarding_completed : false;
            } catch {
                return false;
            }
        };

        if (!checkOnboarding()) {
            // Redirect to onboarding if not completed
            return <Navigate to="/onboarding" />;
        }

        // Redirect to dashboard if onboarding is complete
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Router>
                    <BrandProvider>
                        <AuthProvider>
                            <Routes>
                                <Route path="/login" element={
                                    <PublicRoute>
                                        <Login />
                                    </PublicRoute>
                                } />
                                <Route path="/register" element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                } />
                                <Route path="/forgot-password" element={
                                    <PublicRoute>
                                        <ForgotPassword />
                                    </PublicRoute>
                                } />
                                <Route path="/reset-password" element={
                                    <ResetPassword />
                                } />
                                <Route path="/verify-email" element={
                                    <VerifyEmail />
                                } />

                                {/* Onboarding (Protected) */}
                                <Route path="/onboarding" element={
                                    <ProtectedRoute>
                                        <CreateCompany />
                                    </ProtectedRoute>
                                } />
                                <Route path="/onboarding/create-company" element={
                                    <ProtectedRoute>
                                        <CreateCompany />
                                    </ProtectedRoute>
                                } />

                                {/* Protected Routes with App Layout */}
                                <Route path="/" element={<AppLayout />}>
                                    <Route index element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } />



                                    {/* Account Management */}
                                    <Route path="accounts" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <AccountsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="accounts/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <AccountsShow />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="account-types" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <AccountTypesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="account-industries" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <AccountIndustriesIndex />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="lead-statuses" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <LeadStatusesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="lead-sources" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <LeadSourcesIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Contacts */}
                                    <Route path="contacts" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ContactsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="contacts/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ContactsShow />
                                        </ProtectedRoute>
                                    } />

                                    {/* Core Detail Pages */}
                                    <Route path="companies" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CompaniesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="media-library" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <MediaLibrary />
                                        </ProtectedRoute>
                                    } />

                                    {/* Staff Management */}
                                    <Route path="users" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <UsersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="roles" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <RolesIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Plans & Finance */}
                                    <Route path="opportunities" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <OpportunitiesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="opportunities/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <OpportunitiesShow />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="opportunity-stages" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <OpportunityStagesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="opportunity-sources" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <OpportunitySourcesIndex />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="leads" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <LeadsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="leads/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <LeadsShow />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="calendar" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CalendarIndex />
                                        </ProtectedRoute>
                                    } />


                                    <Route path="plans" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <PlansIndex isAdmin={true} />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="plan-requests" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <PlanRequestsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="plan-orders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <PlanOrdersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="coupons" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CouponsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="currencies" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CurrenciesIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Marketing & Content */}
                                    <Route path="referral" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ReferralProgram />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="referral/referred-users" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ReferredUsers />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="landing-page" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <LandingPageIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="contact-messages" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ContactMessagesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="newsletters" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <NewslettersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="custom-pages" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CustomPagesIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Products & Finance */}
                                    <Route path="products" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ProductsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="invoices" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <InvoicesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="invoices/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <InvoicesShow />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="quotes" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <QuotesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="quotes/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <QuotesShow />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="sales-orders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <SalesOrdersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="sales-orders/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <SalesOrdersShow />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="purchase-orders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <PurchaseOrdersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="delivery-orders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <DeliveryOrdersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="return-orders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ReturnOrdersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="receipt-orders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ReceiptOrdersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="taxes" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <TaxesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="brands" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <BrandsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="categories" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CategoriesIndex />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="email-templates" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <EmailTemplatesIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Settings */}
                                    <Route path="settings" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <SettingsIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Document Management */}
                                    <Route path="document-folders" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <FoldersIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="document-types" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <TypesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="documents" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <DocumentsIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Campaign Management */}
                                    <Route path="campaign-types" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CampaignTypesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="target-lists" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <TargetListsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="campaigns" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CampaignsIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Project Management */}
                                    <Route path="task-statuses" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <TaskStatusesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="project-tasks" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ProjectTasksIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="projects" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ProjectsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="projects/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ProjectsShow />
                                        </ProtectedRoute>
                                    } />

                                    {/* CRM Extensions */}
                                    <Route path="cases" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CasesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="cases/:id" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CasesShow />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="meetings" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <MeetingsIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="calls" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CallsIndex />
                                        </ProtectedRoute>
                                    } />

                                    {/* Reports */}
                                    <Route path="reports/leads" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <LeadReports />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="reports/sales" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <SalesReports />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="reports/product" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ProductReports />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="reports/contacts" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <CustomerReports />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="reports/projects" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ProjectReports />
                                        </ProtectedRoute>
                                    } />

                                    {/* Miscellaneous */}
                                    <Route path="shipping-provider-types" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <ShippingProviderTypesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="notification-templates" element={
                                        <ProtectedRoute requireOnboarding={true}>
                                            <NotificationTemplatesIndex />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="dashboard" element={<Navigate to="/" replace />} />
                                </Route>


                                {/* Catch all */}
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </AuthProvider>
                        <Toaster />
                    </BrandProvider>
                </Router>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
