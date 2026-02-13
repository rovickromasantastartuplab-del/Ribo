# Ribo CRM - Features Included
## Scoped Feature List (Based on features.md)

This document serves as the definitive guide for feature implementation, strictly aligned with the user's selected modules.

---

## 🏢 Company User Features

### 1. Dashboard
**Purpose:** Main analytics and overview page for instant business insights.
**Key Metrics:**
- Total leads, opportunities, accounts, contacts
- Revenue statistics & conversion rates
- Recent activities & upcoming tasks
- Sales pipeline visualization

### 2. Staff Management
#### 2.1 Users
**Components:** `UserController`, `User` model  
- User CRUD operations & profile management
- Role assignment & status management (active/inactive)
- Login history tracking

#### 2.2 Roles & Permissions
**Components:** `RoleController`, `PermissionController`  
- Create custom roles with granular permissions
- Permission categories matching all modules
- Role-based access control (RBAC)

### 3. Lead Management
#### 3.1 Leads
**Components:** `LeadController`, `Lead` model  
- Lead CRUD & assignment to staff
- Helper features: Conversion to opportunity, activity tracking, comments, attachments
- Fields: Name, contact info, source, status, value, notes

#### 3.2 Lead Statuses & Sources
**Components:** `LeadStatusController`, `LeadSourceController`  
- Custom status creation (New, Contacted, Qualified, Lost) with color coding
- Track lead origins (Website, Referral, etc.) for analytics

### 4. Opportunity Management
#### 4.1 Opportunities
**Components:** `OpportunityController`, `Opportunity` model  
- Pipeline management with stage progression
- Link to accounts/contacts
- Value & probability tracking

#### 4.2 Stages & Sources
**Components:** `OpportunityStageController`, `OpportunitySourceController`  
- customizable pipeline stages (Prospecting -> Closed Won)
- Source tracking for ROI analysis

### 5. Account Management
#### 5.1 Accounts
**Components:** `AccountController`, `Account` model  
- Business entity records (Companies)
- Related contacts, opportunities, and activities
- Billing & shipping details

#### 5.2 Types & Industries
**Components:** `AccountTypeController`, `AccountIndustryController`  
- Categorization (Customer, Partner, Vendor)
- Industry tagging (Tech, Finance, Retail)

### 6. Contact Management
**Components:** `ContactController`, `Contact` model  
- Individual person records linked to Accounts
- Activity logging (calls, emails, meetings)
- Social media links & position details

### 7. Invoice Management
**Components:** `InvoiceController`, `Invoice` model  
- Create & manage invoices linked to Accounts/Contacts
- Line items, tax calculations, and discount application
- Status tracking (Draft, Sent, Paid, Overdue)
- PDF generation & email capability

### 8. Document Management
**Components:** `DocumentController`, `DocumentFolderController`  
- centralized file storage with folder hierarchy
- Document categorization (Contracts, Proposals)
- Link documents to Leads, Accounts, or Opportunities

### 9. Campaign Management
**Components:** `CampaignController`, `CampaignTypeController`  
- Marketing campaign tracking (ROI, Budget, Response)
- Campaign types (Email, Webinar, Trade Show)

### 10. Calendar & Activity
**Components:** `CalendarController`, `MeetingController`, `CallController`  
- Unified calendar view
- **Meetings:** Scheduling, attendees, location/links
- **Calls:** Logging, duration, outcome tracking

### 11. Reports
**Components:** `ReportsController` (Logic-based)  
- **Lead Reports:** By source, status, conversion rate
- **Contact Reports:** Activity logs, account distribution
- **Sales Reports:** Pipeline value, win/loss analysis, revenue forecasting

### 12. Plans & Subscriptions
**Components:** `PlanController`, `PlanRequestController`, `PlanOrderController`  
- Subscription plan management (Pricing, Limits)
- Upgrade request workflows & order history

### 13. Media Library
**Components:** `MediaController`  
- Centralized asset management for images/documents
- Used across the platform (Campaigns, Products, etc.)

### 14. Referral Program
**Components:** `ReferralController`  
- Referral code generation & tracking
- Commission/reward management for referring other companies

### 15. Notification Templates
**Components:** `NotificationTemplateController`  
- Customizable Email & System templates
- Variables support (e.g., `{user_name}`, `{invoice_amount}`)

### 16. Settings
**Components:** `SettingsController`  
- **Company:** Logo, address, currency, timezone
- **General:** Theme, language, security settings

---

## 👑 Super Admin Features

### 1. Platform Management
- **Dashboard:** System-wide analytics (Revenue, Companies, Users)
- **Companies:** Tenant management (View, Edit, Suspend, Impersonate)
- **Plans:** Global plan configuration (Features, Limits, Pricing)

### 2. Marketing & Billing
- **Coupons:** Discount codes for subscription plans
- **Currencies:** Multi-currency support for different regions
- **Landing Page:** CMS for the front-facing marketing site (Hero, Features, Pricing)

### 3. System Configuration
- **Email Templates:** Global transactional email designs
- **Settings:** Global system configuration (SMTP, Integrations)



System Features



Dashboard
Staff
-users
-roles
Lead management
-lead statuses
-lead sources
-leads
Opportunity
-opportunity stages
-opportunity sources
-opportunities
Account
-account types
-account industries
-accounts
Contacts
Invoice
Document management
campaign management
Calendar
Meeting
Calls
Reports
-lead reports
-contact reports
-Sales reports
Plans
-plans
-plan requests
-plan orders
Media Library
referral program
Notification Templates
Settings


superadmin
Dashboard
Companies
Media Library
Plans
-plans
-plan requests
-plan orders
Coupons
Currencies
Referral Program
Landing Page
Email Templates
Settings