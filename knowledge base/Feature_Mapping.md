# Features to Database Schema Mapping
## Alignment Analysis

This document maps every item in your `features.md` to the specific tables in the database schema to confirm full coverage.

### ✅ 1. Features with Dedicated Tables
| Feature Group | Feature Item | Database Tables | Mapped? |
|--------------|--------------|-----------------|---------|
| **Staff** | Users | `users` | ✅ Yes |
| | Roles | `roles`, `permissions`, `userRoles`, `rolePermissions` | ✅ Yes |
| **Leads** | Lead Statuses | `leadStatuses` | ✅ Yes |
| | Lead Sources | `leadSources` | ✅ Yes |
| | Leads | `leads`, `leadAssignments` | ✅ Yes |
| **Opportunities** | Stages | `opportunityStages` | ✅ Yes |
| | Sources | `opportunitySources` | ✅ Yes |
| | Opportunities | `opportunities`, `opportunityAssignments` | ✅ Yes |
| **Accounts** | Types | `accountTypes` | ✅ Yes |
| | Industries | `accountIndustries` | ✅ Yes |
| | Accounts | `accounts`, `accountAssignments` | ✅ Yes |
| **Contacts** | Contacts | `contacts`, `contactAssignments` | ✅ Yes |
| **Invoice** | Invoice | `invoices`, `invoiceLineItems`, `invoicePayments` | ✅ Yes |
| **Documents** | Document Mgmt | `documents`, `documentFolders`, `documentTypes`, `documentAssignments` | ✅ Yes |
| **Campaigns** | Campaign Mgmt | `campaigns`, `campaignTypes`, `campaignAssignments` | ✅ Yes |
| **Calendar** | Meetings | `meetings`, `meetingAttendees` | ✅ Yes |
| | Calls | `calls`, `callAttendees` | ✅ Yes |
| **Plans** | Plans | `plans` | ✅ Yes |
| | Request/Orders | `planRequests`, `planOrders` | ✅ Yes |
| **Media** | Media Library | `media` | ✅ Yes |
| **Referrals** | Referral Program | `referrals`, `referralSettings`, `payoutRequests` | ✅ Yes |
| **Templates** | Notifications | `notificationTemplates`, `emailTemplates`, `companyEmailTemplates` | ✅ Yes |
| **Superadmin** | Companies | `companies`, `subscriptions` | ✅ Yes |
| | Coupons | `coupons` | ✅ Yes |
| | Currencies | `currencies` | ✅ Yes |
| | Landing Page | `landingPageSettings` | ✅ Yes |

---

### ℹ️ 2. Features WITHOUT Dedicated Tables (Logic-Based)
These features are **Functional**, meaning they process data from existing tables rather than needing their own storage.

| Feature | Why No Table? | How It Works |
|---------|---------------|--------------|
| **Dashboard** | **Visual View** | Aggregates data from `leads`, `opportunities`, `invoices`, `users` via SQL queries (e.g., "Count leads where status='new'"). |
| **Reports** | **Visual View** | Runs queries like `SELECT sum(amount) FROM invoices WHERE date > '2024-01-01'`. No table needed unless saving complex configurations. |
| **Settings** | **Generic Storage** | Uses the `settings` table (Reference: line 307) which stores Key-Value pairs (e.g., `{'theme': 'dark', 'logo': 'url'}`). |

### 🛠️ Conclusion
**100% of your feature list is covered.**
- **Structural Features** have specific tables.
- **Functional Features** (Dashboard, Reports) rely on the data in those tables.
