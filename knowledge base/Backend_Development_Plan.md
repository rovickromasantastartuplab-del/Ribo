# RIBO CRM - Backend Development Plan

This document outlines the detailed roadmap for implementing the backend API and logic, aligned with the **User Manual**, **Project Reference**, and **Scoped Feature List**.

---

## 🛠️ Phase 1: Core Foundation & Authentication (Week 1)

### 1.1 Authentication & User Session
- [ ] **Endpoints:**
  - `POST /auth/register` (Validate email, create user, create company)
  - `POST /auth/login` (Issue JWT/Session)
  - `POST /auth/logout`
  - `POST /auth/forgot-password` (Already implemented)
  - `POST /auth/reset-password` (Already implemented)
  - `GET /auth/me` (Current user context, company, permissions)
- **Middleware:** `authMiddleware` (Verify Token), `checkPermission` (RBAC)

### 1.2 Profile Management
- [ ] **Endpoints:**
  - `GET /profile`
  - `PUT /profile` (Update name, email)
  - `PUT /profile/avatar` (Upload & update avatar URL)
  - `PUT /profile/password` (Change password)
- **Logic:** Secure password hashing, file upload handling for avatar.

### 1.3 Dashboard Analytics (Company & SuperAdmin)
- [ ] **Endpoints:**
  - `GET /dashboard/summary` (Counts of Leads, Sales, Customers, Projects)
  - `GET /dashboard/revenue` (Chart data: Revenue over time)
  - `GET /dashboard/recent-activity` (Latest logins, new leads)

---

## 👥 Phase 2: Staff & Access Control (Week 1-2)

### 2.1 Role-Based Access Control (RBAC)
- [ ] **Endpoints:**
  - `GET /roles` (List roles)
  - `POST /roles` (Create custom role)
  - `PUT /roles/:id` (Update permissions)
  - `GET /permissions` (List all available system permissions)
- **Database:** `roles`, `permissions`, `rolePermissions`

### 2.2 User Management
- [ ] **Endpoints:**
  - `GET /users` (List staff with pagination & search)
  - `POST /users` (Invite/Create new staff member)
  - `PUT /users/:id` (Update role, status)
  - `DELETE /users/:id` (Soft delete/deactivate)
  - `GET /users/:id/logs` (View login history)
- **Logic:** Send invitation email, enforcing plan user limits.

---

## 💼 Phase 3: CRM Core Modules (Week 2-3)

### 3.1 Lead Management (COMPLETE)
- [x] **Endpoints:**
  - `GET /leads` (Kanban/List view, filter by status)
  - `POST /leads` (Create lead)
  - `GET /leads/:id` (View details)
  - `PUT /leads/:id` (Update status, assign user)
  - `POST /leads/:id/convert-account` & `convert-contact` (Convert Logic)
  - `POST /leads/data/import` & `GET /leads/data/export` (CSV/JSON)
  - `GET /lead-statuses` & `GET /lead-sources` (Configuration)
- **Business Logic:** Auto-assign rules, preventing duplicates, activity logging.

### 3.2 Accounts & Contacts (Next Priority)
- [ ] **Accounts (Companies)**
  - `GET /accounts` (List, Filter, Sort)
  - `POST /accounts` (Create)
  - `GET /accounts/:id` (Details + Related Contacts/Opportunities)
  - `PUT /accounts/:id` (Update)
  - `DELETE /accounts/:id`
  - `GET /account-types` & `GET /account-industries` (Dropdowns)
- [ ] **Contacts (People)**
  - `GET /contacts` (List, Filter)
  - `POST /contacts` (Create, Link to Account)
  - `PUT /contacts/:id`
  - `DELETE /contacts/:id`
- **Logic:** Multi-Assignment for Accounts/Contacts (Pivot Tables).

### 3.3 Opportunity Management (Pipeline)
- [ ] **Endpoints:**
  - `GET /opportunities` (Pipeline view by stage)
  - `POST /opportunities`
  - `PUT /opportunities/:id/stage` (Move stage, update probability)
- **Logic:** Recalculate pipeline value when stage changes.

---

## 📅 Phase 4: Sales Operations & Tools (Week 3-4)

### 4.1 Calendar & Activities
- [ ] **Endpoints:**
  - `GET /calendar/events` (Fetch meetings/calls for range)
  - `POST /meetings` (Schedule meeting, invite attendees)
  - `POST /calls` (Log call outcome)
- **Integrations:** Google Calendar sync (future scope).

### 4.2 Document Management
- [ ] **Endpoints:**
  - `POST /documents/upload` (Upload to storage)
  - `GET /documents` (List by folder/category)
  - `POST /documents/folders` (Create folder)
- **Storage:** Supabase Storage or AWS S3.

### 4.3 Invoicing
- [ ] **Endpoints:**
  - `POST /invoices` (Create invoice with line items)
  - `GET /invoices/:id/pdf` (Generate PDF)
  - `POST /invoices/:id/send` (Email invoice to client)
  - `POST /invoices/:id/payment` (Record manual payment)
- **Logic:** PDF generation, tax calculation, sequential numbering.

---

## 🚀 Phase 5: Growth & Admin Features (Week 5)

### 5.1 Campaigns
- [ ] **Endpoints:**
  - `GET /campaigns`, `POST /campaigns`
  - `GET /campaigns/stats` (ROI, response rate)

### 5.2 Referral Program
- [ ] **Endpoints:**
  - `POST /referrals/generate-code`
  - `GET /referrals/stats` (Track commissions)

### 5.3 Settings & Configuration
- [ ] **Endpoints:**
  - `GET /settings`, `PUT /settings` (Company logo, currency, timezone)
  - `GET /notification-templates`, `PUT /notification-templates/:id`

---

## 🤖 Phase 6: System & AI Integration (Optional/Later)
- [ ] **Endpoints:**
  - `POST /ai/generate-email` (Draft emails using LLM)
  - `POST /ai/summarize-lead` (Summarize notes/activities)

---

## 📝 Technical Standards
- **Framework:** Node.js / Express
- **Database:** PostgreSQL (Supabase)
- **Validation:** Joi or Zod
- **Error Handling:** Global error middleware, standardized JSON response.
- **Testing:** Jest / Supertest for API routes.
