# Subscription Plans Documentation

## Overview

Ribo CRM offers 5 subscription tiers designed to scale from individual users to enterprise teams. All plans are based on the reference project's pricing structure and enforce usage limits through the database schema.

## Plan Tiers

### 1. Free Plan (Default)

**Price**: ₱0/month (Unlimited duration)

**Target Audience**: Individuals tracking leads and basic sales activities

**Usage Limits**:
- 👤 **Users**: 1
- 📁 **Projects**: 1
- 📇 **Contacts**: 50
- 🏢 **Accounts**: 25
- 💾 **Storage**: 1 GB

**Features**:
- ❌ Custom Branding
- ❌ AI Integration (ChatGPT)
- ✅ Lead Management
- ✅ Basic Sales Pipeline
- ✅ Contact Management

**Special Attributes**:
- `isDefault: true` - Automatically assigned to new registrations
- `isTrial: false` - Not a trial, permanent free tier
- `duration: 'unlimited'` - No expiration

---

### 2. Starter Plan

**Price**: ₱999/month (₱9,990/year - 17% savings)

**Target Audience**: Small teams tracking leads, deals, quotes & invoices

**Usage Limits**:
- 👤 **Users**: 3
- 📁 **Projects**: 3
- 📇 **Contacts**: 500
- 🏢 **Accounts**: 200
- 💾 **Storage**: 2 GB

**Features**:
- ❌ Custom Branding
- ❌ AI Integration
- ✅ Team Collaboration (3 users)
- ✅ Quote Management
- ✅ Invoice Tracking
- ✅ Deal Pipeline

---

### 3. Growth Plan

**Price**: ₱1,999/month (₱19,990/year - 17% savings)

**Target Audience**: Growing teams managing active pipelines, follow-ups, and client histories

**Usage Limits**:
- 👤 **Users**: 10
- 📁 **Projects**: 10
- 📇 **Contacts**: 2,000
- 🏢 **Accounts**: 1,000
- 💾 **Storage**: 5 GB

**Features**:
- ✅ Custom Branding
- ❌ AI Integration
- ✅ Advanced Pipeline Management
- ✅ Client History Tracking
- ✅ Follow-up Automation
- ✅ Team Collaboration (10 users)

---

### 4. Pro Plan (Recommended)

**Price**: ₱3,999/month (₱39,990/year - 17% savings)

**Target Audience**: SMEs with advanced reporting, role controls, and workflow needs

**Usage Limits**:
- 👤 **Users**: 25
- 📁 **Projects**: 25
- 📇 **Contacts**: 10,000
- 🏢 **Accounts**: 5,000
- 💾 **Storage**: 15 GB

**Features**:
- ✅ Custom Branding
- ✅ AI Integration (ChatGPT)
- ✅ Advanced Reports & Analytics
- ✅ Role-Based Access Control
- ✅ Workflow Automation
- ✅ Priority Support

**Why Recommended**: Best value for growing businesses needing AI features and advanced controls

---

### 5. Business+ Plan

**Price**: ₱6,999/month (₱69,990/year - 17% savings)

**Target Audience**: Scaling teams with heavy customer volume and analytics needs

**Usage Limits**:
- 👤 **Users**: 50
- 📁 **Projects**: 50
- 📇 **Contacts**: 30,000
- 🏢 **Accounts**: 15,000
- 💾 **Storage**: 50 GB

**Features**:
- ✅ Custom Branding
- ✅ AI Integration (ChatGPT)
- ✅ Enterprise Analytics
- ✅ Unlimited Automation
- ✅ Dedicated Support
- ✅ API Access
- ✅ Custom Integrations

---

## Plan Comparison Table

| Feature | Free | Starter | Growth | Pro | Business+ |
|---------|------|---------|--------|-----|-----------|
| **Price/month** | ₱0 | ₱999 | ₱1,999 | ₱3,999 | ₱6,999 |
| **Users** | 1 | 3 | 10 | 25 | 50 |
| **Projects** | 1 | 3 | 10 | 25 | 50 |
| **Contacts** | 50 | 500 | 2,000 | 10,000 | 30,000 |
| **Accounts** | 25 | 200 | 1,000 | 5,000 | 15,000 |
| **Storage** | 1 GB | 2 GB | 5 GB | 15 GB | 50 GB |
| **Custom Branding** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **AI Integration** | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Technical Implementation

### Database Schema

Plans are stored in the `plans` table with the following structure:

```sql
CREATE TABLE "plans" (
  "planId" UUID PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "price" DECIMAL(10,2) NOT NULL,
  "yearlyPrice" DECIMAL(10,2) NULL,
  "duration" VARCHAR(50) NOT NULL,
  "maxUsers" INT NOT NULL,
  "maxProjects" INT NOT NULL,
  "maxContacts" INT NOT NULL,
  "maxAccounts" INT NOT NULL,
  "storageLimit" DECIMAL(15,2) NOT NULL,
  "enableBranding" BOOLEAN NOT NULL,
  "enableChatgpt" BOOLEAN NOT NULL,
  "isTrial" BOOLEAN NOT NULL,
  "trialDays" INT NOT NULL,
  "isActive" BOOLEAN NOT NULL,
  "isDefault" BOOLEAN NOT NULL,
  "modules" JSONB NULL,
  "description" TEXT NULL
);
```

### Subscription Assignment

When a user registers, the `handle_new_user()` trigger automatically:

1. Finds the default plan (`isDefault = true`)
2. Creates a subscription record linking the company to the plan
3. Enforces usage limits based on the plan's `max*` fields

```sql
-- Trigger logic (simplified)
SELECT "planId" INTO v_trial_plan_id
FROM plans
WHERE "isDefault" = true OR "isTrial" = true
ORDER BY "isTrial" DESC, "isDefault" DESC
LIMIT 1;

INSERT INTO subscriptions ("companyId", "planId", "startDate", "isActive")
VALUES (v_company_id, v_trial_plan_id, NOW(), TRUE);
```

### Enforcing Limits

Usage limits should be enforced at the application level:

**Example: Contact Creation**
```javascript
// Check current contact count
const { count } = await supabase
  .from('contacts')
  .select('*', { count: 'exact', head: true })
  .eq('companyId', user.companyId);

// Get plan limit
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('plans(maxContacts)')
  .eq('companyId', user.companyId)
  .eq('isActive', true)
  .single();

// Enforce limit
if (count >= subscription.plans.maxContacts) {
  throw new Error('Contact limit reached. Please upgrade your plan.');
}
```

---

## Plan Management

### Upgrading Plans

Users can upgrade their plan through the billing page. The process:

1. User selects a higher-tier plan
2. Payment is processed
3. Subscription record is updated with new `planId`
4. New limits take effect immediately

### Downgrading Plans

When downgrading:

1. Check if current usage exceeds new plan limits
2. If yes, prevent downgrade or require data cleanup
3. If no, update subscription
4. New limits enforced on next operation

### Plan Expiration

For paid plans:

- `expiryDate` is set based on billing cycle
- Cron job checks for expired subscriptions daily
- Expired subscriptions are marked `isActive = false`
- Company is downgraded to Free plan automatically

---

## Pricing Strategy

### Annual Discount

All paid plans offer **17% savings** on annual billing:

- Starter: ₱999/mo × 12 = ₱11,988 → ₱9,990/year
- Growth: ₱1,999/mo × 12 = ₱23,988 → ₱19,990/year
- Pro: ₱3,999/mo × 12 = ₱47,988 → ₱39,990/year
- Business+: ₱6,999/mo × 12 = ₱83,988 → ₱69,990/year

### Free Plan Strategy

The Free plan serves as:
- **Lead generation**: Get users into the ecosystem
- **Product validation**: Let users experience core features
- **Upsell funnel**: Natural upgrade path when limits are reached

---

## Related Documentation

- [User Registration Trigger](./User_Registration_Trigger.md) - How plans are assigned on signup
- [Database Setup Guide](./Database_Setup_Guide.md) - How to seed plans
- [Database Schema](../Knowledge%20base/Database%20Schema) - Complete schema reference

---

## Seeding Plans

To populate the plans table, run the SQL script:

```bash
# Location: server/scripts/02_seed_plans.sql
```

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `02_seed_plans.sql`
3. Run the script
4. Verify with: `SELECT name, price, "isDefault" FROM plans;`

**Note**: The script uses `ON CONFLICT (name) DO UPDATE` to safely re-run without duplicates.
