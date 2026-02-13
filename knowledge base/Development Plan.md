📅 Detailed CRM Development Master Plan
Technology Stack:

Database: Supabase (PostgreSQL)
Frontend/Backend: Next.js (React + Node.js)
Styling: Tailwind CSS + Shadcn UI
Auth: Supabase Auth
State Management: TanStack Query (React Query)
This document outlines the step-by-step technical implementation for the CRM. Each phase builds upon the previous one.

🏗️ Phase 1: Foundation & Identity (The "Skeleton")
Goal: Users can sign up, log in, create their company, and invite staff.

1.1 Authentication & Onboarding
 Database: Ensure superadmins, companies, users tables are ready.
 Supabase Auth:
Enable Email/Password provider.
Set up Auth Hooks (Trigger to create users record on signup).
 Frontend (Auth Pages):
Login Page.
Register Page (Company Signup).
Forgot Password Page.
 Onboarding Flow:
"Create Company" form after registration.
Initial 
settings
 population (default checks).
1.2 User & Role Management
 Database: roles, permissions, userRoles.
 Backend/Policies:
RLS Policies for users (Users can only see their own company).
Policy for "Super Admin" vs "Company Admin" vs "Staff".
 Frontend (Staff Module):
User List Table (Invite, Edit, Delete).
Role Management (Create Role, Assign Permissions).
Profile Page (Edit own details, change password).
1.3 Company Settings
 Database: strategies, media (for logo).
 Frontend:
General Settings (Company Name, Address, Currency).
Branding Settings (Upload Logo, Theme Colors).
🚀 Phase 2: The Logic Core (Leads & Configuration)
Goal: Configure the CRM for business and start capturing leads.

2.1 CRM Configuration/Settings
 Database: leadStatuses, leadSources, accountTypes, accountIndustries.
 Frontend:
"Pipelines & Statuses" Settings Page.
CRUD interfaces for Sources and Industries.
2.2 Lead Management Module
 Database: leads, leadAssignments.
 Backend:
"Convert Lead" Logic (Transaction to create Account + Contact).
 Frontend:
Kanban Board for Leads (Drag & Drop status change).
Lead List View (Filters, Search).
Lead Detail View:
Basic Info.
Activity Timeline (Notes).
Assign Staff (Multi-select).
💼 Phase 3: Deal Flow (Accounts, Contacts, Opportunities)
Goal: Manage the sales pipeline and relationships.

3.1 Account & Contact Management
 Database: accounts, 
contacts
, accountAssignments, contactAssignments.
 Frontend:
Account List & Detail View.
Contact List & Detail View.
"Related" Tabs (See all Contacts for an Account).
3.2 Opportunity (Deal) Management
 Database: opportunities, opportunityStages, opportunityAssignments.
 Frontend:
Deal Pipeline (Kanban): The heart of the CRM.
Deal Detail View:
Products/Line Items.
Stage History.
Probability tracking.
3.3 Activity Tracking
 Database: meetings, calls, meetingAttendees.
 Frontend:
Calendar View (Day/Week/Month).
"Log Activity" Modal (Call, Meeting, Email).
Sync Logic (Optional: Google Calendar Integration).
💰 Phase 4: Sales Operations (The "Cash" Phase)
Goal: Generate documents and track revenue.

4.1 Product Catalog
 Database: 
products
 (if not already in schema, need to add simple product table or use ad-hoc items).
 Frontend:
Product Library.
4.2 Quotes & Estimates
 Database: 
quotes
, quoteAssignments.
 Frontend:
Quote Builder (Add Items, Calculate Tax/Discount).
"Send to Client" (Generate PDF/Link).
Quote Status Tracking (Draft -> Sent -> Accepted).
4.3 Orders & Invoices
 Database: salesOrders, invoices, invoicePayments.
 Frontend:
Convert Quote -> Sales Order -> Invoice.
Invoice List (Track Overdue/Paid).
Record Payment Modal.
🏗️ Phase 5: Project Delivery
Goal: Deliver the work sold in Phase 4.

5.1 Projects & Tasks
 Database: 
projects
, projectTasks, taskStatuses.
 Frontend:
Project Dashboard.
Task Kanban/List.
Time Tracking (Optional).
File Attachments (using media table).
🧠 Phase 6: Platform Intelligence & Super Admin
Goal: Management, Analytics, and SaaS Monetization.

6.1 SaaS Platform Management
 Database: plans, subscriptions, 
planOrders
.
 Frontend (Super Admin):
Plan Management (Create/Edit Plans).
Tenant List (View all companies).
Subscription Overview.
6.2 Frontend (Tenant)**:
 Billing Portal (View Plan, Request Upgrade, Download Invoices).
6.3 Reports & Dashboard
 Frontend:
Main Dashboard (Widgets: Revenue, Leads by Status, Tasks Due).
Report Generator (Date Range filters).
Charts (Recharts/Chart.js implementation).
🛡️ Verification Steps (Continuous)
 RLS Testing: Test that Company A cannot see Company B's data for every new table.
 Role Testing: Test that "Staff" cannot delete "Company Settings".
 Responsive Check: Mobile view for Kanbans and Tables.