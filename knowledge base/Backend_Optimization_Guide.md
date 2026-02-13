# Backend Optimization & Safety Guide

## 🚀 Data Fetching Best Practices

!Make sure to read the Database Schema.md file before reading this file.!

### 1. Prevent N+1 Problems
**Problem:** Fetching a list of items (1 query) and then looping through them to fetch related data (N queries).
**Solution:**
- **Use Database Joins:** Leverage Supabase's relational querying.
  ```javascript
  // ❌ BAD: N+1
  const { data: leads } = await supabase.from('leads').select('*');
  for (const lead of leads) {
      const { data: user } = await supabase.from('users').eq('id', lead.userId); // N Queries!
  }

  // ✅ GOOD: Single Query with Join
  const { data: leads } = await supabase
      .from('leads')
      .select('*, user:userId(name, email)'); // DB handles the join
  ```

### 2. Parallel Execution
**Problem:** Running independent queries sequentially (waiting for A to finish before starting B).
**Solution:**
- **Use `Promise.all`:** Execute concurrent queries.
  ```javascript
  // ❌ BAD: Sequential (Slow)
  const leads = await getLeads();   // Takes 200ms
  const sales = await getSales();   // Takes 200ms -> Total 400ms

  // ✅ GOOD: Parallel (Fast)
  const [leads, sales] = await Promise.all([
      getLeads(),  // Starts at T+0
      getSales()   // Starts at T+0 -> Total ~200ms
  ]);
  ```

---

## 🛡️ Safe Fetching & Error Handling

### 1. Graceful Degredation (Optional Tables)
**Problem:** Logic crashes if a feature table (like `projects`) is missing or disabled.
**Solution:**
- **Wrap in Try/Catch or Catch Block:**
  ```javascript
  // Handle missing tables safely
  const projects = await supabase.from('projects')
      .select('count')
      .then(res => res)
      .catch(() => ({ count: 0, error: null })); // Return default if fails
  ```

### 2. Row Level Security (RLS) Compliance
**Rule:** Always assume RLS is active. The database will filter results based on the authenticated user.
- **Do NOT** bypass RLS (using service role key) unless absolutely necessary for admin tasks.
- **Verify:** Ensure every query implicitly filters by `companyId` or `userId` via the auth context.

### 3. Pagination limits
**Problem:** Fetching `select('*')` on a table with 100,000 rows will crash the server.
**Solution:**
- **Enforce Limits:**
  ```javascript
  .select('*')
  .limit(50) // Always set a hard limit
  .range(0, 49) // Use pagination
  ```

---

## 🔍 Database Indexing Strategy
Indexing is crucial for maintaining sub-100ms response times. The **Database Schema** already includes optimized indexes for core tables.

### 1. Existing Core Indexes (Reference)
The following key indexes are already implemented in the schema:

| Table | Index Columns | Purpose |
|-------|---------------|---------|
| `leads` | `(companyId)`, `(status)`, `(sourceId)` | Filtering by company and status |
| `invoices` | `(companyId)`, `(status)`, `(invoiceDate)` | Dashboard revenue calculations |
| `contacts` | `(companyId)`, `(accountId)` | Quick lookup of contacts per account |
| `accounts` | `(companyId)`, `(industryId)` | Filtering accounts |
| `opportunities` | `(companyId)`, `(stageId)` | Pipeline visualization |
| `salesOrders` | `(companyId)`, `(status)`, `(orderDate)` | Order tracking |
| `documents` | `(companyId)`, `(folderId)` | File organization |
| `media` | `(companyId)`, `(collectionName)` | Media library filtering |
| `loginHistories` | `(companyId)`, `(userId)`, `(loginAt)` | Activity logs & Security |

### 2. Mandatory Rules for New Tables
**Rule:** Any new table MUST follow this indexing pattern:
1.  **Foreign Keys:** Index `companyId` and any other FK (e.g. `userId`).
2.  **Status/Type:** Index low-cardinality columns used for filtering lists.
3.  **Dates:** Index date columns used in range queries (e.g. `createdAt`, `dueDate`).

**Example SQL:**
```sql
CREATE INDEX "idx_new_table_company" ON "newTable"("companyId");
CREATE INDEX "idx_new_table_status" ON "newTable"("status");
```

### 3. Search Optimization
...

---

## 🧩 User Context Pattern (Museo Method)

**Philosophy:** Keep Authentication Middleware lightweight (Zero-DB). Do not hydrate every request with a full user profile unless the specific endpoint needs it.

**Implementation:**
1.  **Middleware (`auth.js`):** checks JWT only. Sets `req.user = { id, email }`.
2.  **Controller:** Uses a helper to fetch extra context (like `companyId` or `role`).

### Helper Usage
Use the shared utility to fetch context efficiently:

```javascript
import { getCompanyId } from '../utils/userHelpers.js';

export const myController = async (req, res) => {
    // only fetch if needed
    const companyId = await getCompanyId(req.user); 
    
    if (!companyId) return res.status(400).json({ error: "No company found" });
    // ...
};
```

**Benefits:**
- **Performance:** No DB hit for simple authorized requests (e.g. Health checks, simple lookups).
- **Clarity:** Controller explicitly declares its data dependencies.
- **Safety:** Helper handles the "missing profile" edge case.

---

## ⚡ Unified Response Structure
Ensure all API responses follow a predictable format for the client to handle safely.

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error
{
  "success": false,
  "error": "Readable error message",
  "code": "ERROR_CODE"
}
```

