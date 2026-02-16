# Frontend Integration Guide 🔌

## 1. Authentication Module 🔐
**Base URL:** `/api/auth`

| Endpoint | Method | Purpose | Payload (JSON) | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `POST` | User Login | `{ "email": "...", "password": "..." }` | `{ "user": {...}, "session": { "access_token": "..." } }` |
| `/register` | `POST` | New User Signup | `{ "name": "...", "email": "...", "password": "..." }` | `{ "message": "User registered successfully" }` |
| `/logout` | `POST` | Logout | `{}` | `{ "message": "Logout successful" }` |
| `/forgot-password` | `POST` | Request Reset | `{ "email": "..." }` | `{ "message": "..." }` |
| `/reset-password` | `POST` | Reset Password | `{ "access_token": "...", "new_password": "..." }` | `{ "message": "Success" }` |
| `/me` | `GET` | Get Current User | (Headers Only) | `{ "user": { "userId": "...", "role": {...} } }` |

> **Frontend Note:** Store the `access_token` from `/login` and send it in the `Authorization: Bearer <token>` header for ALL protected requests.

---

## 2. Registration Flow 📝
**Base URL:** `/api/registration`

This is for completing the profile after email confirmation or initial signup.

| Endpoint | Method | Purpose | Payload (JSON) |
| :--- | :--- | :--- | :--- |
| `/complete` | `POST` | Finalize Setup | `{ "access_token": "...", "name": "...", "companyName": "..." }` |

---

## 3. Core Modules (Protected) 🛡️
**Base URL:** `/api`
**Headers Required:** `Authorization: Bearer <token>`

### 🏢 Companies
| Endpoint | Method | Purpose | Payload / Usage |
| :--- | :--- | :--- | :--- |
| `/companies/my-company` | `GET` | Get User's Company | No Body. Returns company details + subscription. |
| `/companies/my-company` | `PUT` | Update Company/Onboarding | `{ "name": "...", "phone": "...", "address": "...", "isOnboarded": true }` |

### 👤 Profile
| Endpoint | Method | Purpose | Payload / Usage |
| :--- | :--- | :--- | :--- |
| `/profile` | `GET` | Get My Profile | No Body. Detailed user data. |
| `/profile` | `PUT` | Update Profile | `{ "name": "...", "lang": "fr", "mode": "dark", "isOnboarded": true }` |
| `/profile/password` | `PUT` | Change Password | `{ "currentPassword": "...", "newPassword": "..." }` |

### ⚙️ Settings (System)
| Endpoint | Method | Purpose | Payload / Usage |
| :--- | :--- | :--- | :--- |
| `/settings` | `GET` | Get All Settings | No Body. Returns `{ "currency": "USD", "timezone": "..." }` |
| `/settings` | `POST` | Update Settings | `{ "currency": "EUR", "notifications": true }` |

---

## 4. CRM Modules 📊
These modules follow a standard CRUD pattern.

**Standard Pattern:**
*   **List:** `GET /api/<resource>` (params: `page`, `limit`, `search`)
*   **Detail:** `GET /api/<resource>/:id`
*   **Create:** `POST /api/<resource>`
*   **Update:** `PUT /api/<resource>/:id`
*   **Delete:** `DELETE /api/<resource>/:id`

### 🎯 Leads
**Resource:** `/leads`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `lead.view` | List all leads | Leads Index / Dashboard |
| **GET** | `/:id` | `lead.view` | Get single lead details | Lead Detail Page |
| **POST** | `/` | `lead.create` | Create a new lead | "Add Lead" Modal/Page |
| **PUT** | `/:id` | `lead.edit` | Update lead details | Lead Detail Page |
| **DELETE** | `/:id` | `lead.delete` | Delete a lead | Lead List / Detail |
| **POST** | `/:id/convert-account` | `lead.convert` | Convert Lead to Account | Lead Detail Action |
| **POST** | `/:id/convert-contact` | `lead.convert` | Convert Lead to Contact | Lead Detail Action |
| **GET** | `/data/export` | `lead.export` | Export leads to CSV | Leads Index Action |
| **POST** | `/data/import` | `lead.import` | Import leads from CSV | Leads Index Action |

### 🏢 Accounts
**Resource:** `/accounts`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `account.view` | List accounts | Accounts Index |
| **GET** | `/:id` | `account.view` | Get account details | Account Detail Page |
| **POST** | `/` | `account.create` | Create new account | "Add Account" Modal |
| **PUT** | `/:id` | `account.edit` | Update account | Account Detail Page |
| **DELETE** | `/:id` | `account.delete` | Delete account | Account List / Detail |

### 👥 Contacts
**Resource:** `/contacts`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `contact.view` | List contacts | Contacts Index |
| **GET** | `/:id` | `contact.view` | Get contact details | Contact Detail Page |
| **POST** | `/` | `contact.create` | Create contact | "Add Contact" Modal |
| **PUT** | `/:id` | `contact.edit` | Update contact | Contact Detail Page |
| **DELETE** | `/:id` | `contact.delete` | Delete contact | Contact List / Detail |

### 💡 Opportunities
**Resource:** `/opportunities`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `opportunity.view` | List opportunities | Opportunities Index (Kanban/List) |
| **GET** | `/:id` | `opportunity.view` | Get opportunity details | Opportunity Detail Page |
| **POST** | `/` | `opportunity.create` | Create opportunity | "Add Opportunity" Modal |
| **PUT** | `/:id` | `opportunity.edit` | Update opportunity | Opportunity Detail Page |
| **DELETE** | `/:id` | `opportunity.delete` | Delete opportunity | Opportunity List / Detail |
| **GET** | `/stages` | `opportunityStage.view` | List Stages | Config / Kanban Columns |
| **GET** | `/sources` | `opportunitySource.view` | List Sources | Config / Dropdowns |

---

## 5. Reports Module 📈
**Resource:** `/reports`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/leads` | `report.view` | Lead Statistics | Reports: Sales |
| **GET** | `/subscriptions` | `report.view` | Subscription/Income Trends | Reports: Finance |
| **GET** | `/plans` | `report.view` | Plan Popularity | Reports: Products |
| **GET** | `/customers` | `report.view` | Customer Growth | Reports: Customers |

---

## 6. Dashboard Module 📊
**Resource:** `/dashboard`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/summary` | `auth` (All) | KPI Counters (Leads, Rev) | Dashboard (Top Cards) |
| **GET** | `/revenue` | `auth` (All) | Revenue Chart Data | Dashboard (Main Chart) |
| **GET** | `/recent-activity` | `auth` (All) | Recent Activity Feed | Dashboard (Side Panel) |
| **GET** | `/charts` | `auth` (All) | Secondary Charts | Dashboard (Widgets) |
| **GET** | `/lists` | `auth` (All) | Recent Items Lists | Dashboard (Bottom Lists) |

---

## 6. Team Management 👥
Manage users and permissions within the company.

### 👥 Users
**Resource:** `/users`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `user.view` | List users | User Management Page |
| **POST** | `/` | `user.create` | Invite User | "Invite User" Modal |
| **PUT** | `/:id` | `user.edit` | Update User Details | User Edit Modal |
| **POST** | `/:id/resend-invite` | `user.edit` | Resend Invitation | User List Action |
| **DELETE** | `/:id` | `user.delete` | Delete/Deactivate User | User List Action |

### 🔐 Roles
**Resource:** `/roles`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `role.view` | List Roles | Role Management Page |
| **POST** | `/` | `role.create` | Create Custom Role | "Add Role" Modal |
| **PUT** | `/:id` | `role.edit` | Update Role Name | Role Edit Modal |
| **DELETE** | `/:id` | `role.delete` | Delete Role | Role List Action |
| **GET** | `/permissions` | `role.view` | List All Permission Keys | Role Management (for checkboxes) |
| **PUT** | `/:id/permissions` | `role.edit` | Update Role Permissions | Role Matrix / Config |

---

## 7. System Configuration ⚙️
Manage dynamic lists and categories.

### 🏷️ Lead Configuration
**Resources:** `/lead-statuses`, `/lead-sources`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/lead-statuses` | `leadStatus.view` | List Statuses | Settings: Leads |
| **POST** | `/lead-statuses` | `leadStatus.create` | Create Status | Settings: Leads |
| **GET** | `/lead-sources` | `leadSource.view` | List Sources | Settings: Leads |
| **POST** | `/lead-sources` | `leadSource.create` | Create Source | Settings: Leads |

### 📁 Document Configuration
**Resources:** `/document-types`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/document-types` | `documentType.view` | List Doc Types | Settings: Documents |
| **POST** | `/document-types` | `documentType.create` | Create Doc Type | Settings: Documents |

### 📣 Marketing Configuration
**Resources:** `/campaign-types`, `/target-lists`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/campaign-types` | `campaignType.view` | List Types | Settings: Marketing |
| **POST** | `/campaign-types` | `campaignType.create` | Create Type | Settings: Marketing |
| **GET** | `/target-lists` | `targetList.view` | List Targets | Settings: Marketing |
| **POST** | `/target-lists` | `targetList.create` | Create Target | Settings: Marketing |

---

## 8. Engagement & Activities 📅

### 🤝 Meetings
**Resource:** `/meetings`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `meeting.view` | List meetings | Activity Calendar / List |
| **GET** | `/:id` | `meeting.view` | Get details | Meeting Detail |
| **POST** | `/` | `meeting.create` | Schedule Meeting | "Add Meeting" Modal |
| **PUT** | `/:id` | `meeting.edit` | Update details | Meeting Detail |
| **PUT** | `/:id/toggle-status` | `meeting.edit` | Complete/Cancel | Meeting Action |
| **DELETE** | `/:id` | `meeting.delete` | Delete meeting | Meeting List Action |

### 📞 Calls
**Resource:** `/calls`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `call.view` | List calls | Activity List |
| **GET** | `/:id` | `call.view` | Get details | Call Detail |
| **POST** | `/` | `call.create` | Log Call | "Log Call" Modal |
| **PUT** | `/:id` | `call.edit` | Update details | Call Detail |
| **PUT** | `/:id/toggle-status` | `call.edit` | Complete/Cancel | Call Action |
| **DELETE** | `/:id` | `call.delete` | Delete call | Call List Action |

---

## 9. Marketing 📢

### 📣 Campaigns
**Resource:** `/campaigns`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `campaign.view` | List Campaigns | Campaigns Index |
| **GET** | `/:id` | `campaign.view` | Get details | Campaign Detail |
| **POST** | `/` | `campaign.create` | Create Campaign | "Add Campaign" Modal |
| **PUT** | `/:id` | `campaign.edit` | Update details | Campaign Detail |
| **PUT** | `/:id/toggle-status` | `campaign.update` | Activate/Pause | Campaign List Action |
| **DELETE** | `/:id` | `campaign.delete` | Delete Campaign | Campaign List Action |


---

## 10. Documents 📂
**Resource:** `/documents` (Files) & `/document-folders`

### 📄 Files

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `document.view` | List Documents | Documents Index |
| **POST** | `/` | `document.create` | Upload/Link File | "Upload" Modal |
| **GET** | `/:id/download` | `document.download` | Download File | List Action |
| **PUT** | `/:id` | `document.edit` | Update Metadata | Edit Modal |
| **DELETE** | `/:id` | `document.delete` | Delete File | List Action |

### 📂 Folders

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `document.view` | List Folders | Documents Sidebar |
| **POST** | `/` | `document.create` | Create Folder | "Add Folder" Modal |
| **PUT** | `/:id` | `document.edit` | Rename Folder | Edit Action |
| **DELETE** | `/:id` | `document.delete` | Delete Folder | List Action |

---

## 11. Reports Module 📈
(See above for endpoints)

---

## 12. Settings Module ⚙️
**Resource:** `/settings`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `setting.view` | Get System Settings | Settings: General |
| **POST** | `/` | `setting.edit` | Update Settings | Settings: General |

---

## 13. Billing & Plans 💳
Managing subscriptions and payments.

### 📦 Plans
**Resource:** `/plans`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `plan.view` | List Plans | Pricing Page / Admin List |
| **GET** | `/:id` | `plan.view` | Get Plan Details | Plan Detail |
| **POST** | `/` | `plan.create` | Create Plan | Admin: Add Plan |
| **PUT** | `/:id` | `plan.edit` | Update Plan | Admin: Edit Plan |
| **PUT** | `/:id/toggle` | `plan.edit` | Toggle Active Status | Admin List Action |
| **DELETE** | `/:id` | `plan.delete` | Delete Plan | Admin List Action |

### 📝 Plan Requests
**Resource:** `/plan-requests` (For Manual Payments/Bank Transfer)

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `planRequest.view` | List Requests | User: My Billing / Admin: Requests |
| **POST** | `/` | `planRequest.create` | Submit Request | Checkout Page (Manual) |
| **PUT** | `/:id/status` | `planRequest.edit` | Approve/Reject | Admin: Request Detail |

### 🛒 Plan Orders
**Resource:** `/plan-orders` (For Checkout)

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `planOrder.view` | List Orders | User: My Billing / Admin: Orders |
| **POST** | `/` | `planOrder.create` | Create Order (Pay) | Checkout Page |
| **PUT** | `/:id/status` | `planOrder.edit` | Update Status | Admin Action |

### 🎟️ Coupons
**Resource:** `/coupons`

| Method | Endpoint | Permission | Purpose | Page Context |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/validate` | (Public/Auth) | Validate Code | Checkout Page |
| **GET** | `/` | `coupon.view` | List Coupons | Admin: Coupons |
| **POST** | `/` | `coupon.create` | Create Coupon | Admin: Add Coupon |
| **PUT** | `/:id` | `coupon.edit` | Update Coupon | Admin: Edit Coupon |
| **DELETE** | `/:id` | `coupon.delete` | Delete Coupon | Admin List Action |

---

## 14. Notifications 🔔
**Resource:** `/notification-templates`

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/` | `GET` | List all templates |
| `/types` | `GET` | List template types |
| `/user/preferences` | `GET` | Get My Notification Settings |
| `/user/preferences/:id` | `PUT` | Toggle My Preference (Email/In-App) |

---

## 15. Middleware & Error Handling 🛡️

### Authentication (`authMiddleware`)
*   **Requirement:** All protected routes require `Authorization: Bearer <token>`.
*   **Error 401:** Invalid or expired token. Frontend should redirect to Login.

### Authorization (`authorize`)
*   **Requirement:** User role must have the specific permission (e.g., `lead.create`).
*   **Error 403:** "Forbidden: Insufficient Permissions". Frontend should hide buttons/routes based on `req.user.role.permissions` to avoid this.

### Plan Limits (`checkLimit`)
*   **Requirement:** Checks if company subscription allows the action (e.g., "Max 5 Users").
*   **Error 403:** "Plan limit reached". Frontend should show Upgrade Prompt.

### Utilities
*   **Pagination:** List endpoints accept `?page=1&limit=10`. Response includes `meta: { total, page, lastPage }`.
*   **Standard Error Format:**
    ```json
    {
      "success": false,
      "error": "Detailed error message"
    }
    ```

---

## Access Control & Permissions 🛡️
Use the `req.user.role.permissions` array returned in `/api/auth/me` to toggle UI visibility.

**New Standard:** 
*   **Menu Visibility**: Check for `[module].manage` (e.g., `lead.manage`).
*   **Data Access**: Check for `[module].view` (e.g., `lead.view`).

**Examples:**
*   `lead.manage` -> Show/Hide "Leads" in Sidebar
*   `user.manage` -> Show/Hide "Users" in Sidebar
*   `setting.manage` -> Show/Hide Settings Page

---

## Reference: All Permission Keys 🔑
Use these keys for `[module].manage` (Menu) and `[module].view` (Data).

| Module | Keys Available |
| :--- | :--- |
| **Dashboard** | `dashboard.view`, `dashboard.manage` |
| **Users** | `user.view`, `user.create`, `user.edit`, `user.delete`, `user.manage` |
| **Roles** | `role.view`, `role.create`, `role.edit`, `role.delete`, `role.manage` |
| **Leads** | `lead.view`, `lead.create`, `lead.edit`, `lead.delete`, `lead.convert`, `lead.import`, `lead.export`, `lead.manage` |
| **Lead Status** | `leadStatus.view`, `leadStatus.create`, `leadStatus.edit`, `leadStatus.delete`, `leadStatus.manage` |
| **Lead Source** | `leadSource.view`, `leadSource.create`, `leadSource.edit`, `leadSource.delete`, `leadSource.manage` |
| **Opportunities** | `opportunity.view`, `opportunity.create`, `opportunity.edit`, `opportunity.delete`, `opportunity.manage` |
| **Accounts** | `account.view`, `account.create`, `account.edit`, `account.delete`, `account.import`, `account.export`, `account.manage` |
| **Contacts** | `contact.view`, `contact.create`, `contact.edit`, `contact.delete`, `contact.import`, `contact.export`, `contact.manage` |
| **Invoices** | `invoice.view`, `invoice.create`, `invoice.edit`, `invoice.delete`, `invoice.send`, `invoice.download`, `invoice.manage` |
| **Documents** | `document.view`, `document.create`, `document.edit`, `document.delete`, `document.download`, `document.manage` |
| **Campaigns** | `campaign.view`, `campaign.create`, `campaign.edit`, `campaign.delete`, `campaign.manage` |
| **Target Lists** | `targetList.view`, `targetList.create`, `targetList.edit`, `targetList.delete`, `targetList.manage` |
| **Calendar** | `calendar.view`, `calendar.manage` |
| **Meetings** | `meeting.view`, `meeting.create`, `meeting.edit`, `meeting.delete`, `meeting.manage` |
| **Calls** | `call.view`, `call.create`, `call.edit`, `call.delete`, `call.log`, `call.manage` |
| **Tasks** | `task.view`, `task.create`, `task.edit`, `task.delete`, `task.manage` |
| **Reports** | `report.view`, `report.export`, `report.manage` |
| **Plans** | `plan.view`, `plan.create`, `plan.edit`, `plan.delete`, `plan.manage` |
| **Plan Orders** | `planOrder.view`, `planOrder.create`, `planOrder.edit`, `planOrder.delete`, `planOrder.approve`, `planOrder.reject`, `planOrder.manage` |
| **Coupons** | `coupon.view`, `coupon.create`, `coupon.edit`, `coupon.delete`, `coupon.manage` |
| **Media** | `media.view`, `media.create`, `media.edit`, `media.delete`, `media.upload`, `media.manage` |
| **Referrals** | `referral.view`, `referral.create`, `referral.edit`, `referral.delete`, `referral.approve`, `referral.reject`, `referral.manage` |
| **Notifications** | `notificationTemplate.view`, `notificationTemplate.create`, `notificationTemplate.edit`, `notificationTemplate.delete`, `notificationTemplate.send`, `notificationTemplate.manage` |
| **Settings** | `setting.view`, `setting.edit`, `setting.manage` |
