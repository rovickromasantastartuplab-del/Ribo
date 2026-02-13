# Authorization System Overview (RBAC)

This document explains how the Role-Based Access Control (RBAC) system works in Ribo CRM.

## 1. The Foundation: Database Structure
We use a standard normalized schema to store permissions.

- **`permissions`**: The atomic actions a user can perform.
  - Example: `lead.create`, `lead.view`, `lead.delete`.
  - These are seeded automatically (we have ~52 permissions).

- **`roles`**: A collection of permissions.
  - Example: "Sales Rep", "Manager".
  - A Role belongs to a **Company** (`companyId`).

- **`rolePermissions`** (Pivot Table): Links Roles to Permissions.
  - Example: "Sales Rep" (Role) -> "lead.view" (Permission).
  - Example: "Sales Rep" (Role) -> "lead.create" (Permission).

- **`userRoles`** (Pivot Table): Links Users to Roles.
  - Example: "John Doe" (User) -> "Sales Rep" (Role).

## 2. The Flow: How it Works

### Step A: User Logs In
1. User logs in with Email/Password.
2. Backend validates credentials against **Supabase Auth**.
3. Backend issues an **Access Token** (JWT).

### Step B: User Makes a Request
User tries to access: `GET /api/leads` (View Leads).
This route is protected:
```javascript
router.get('/leads', authMiddleware, authorize('lead.view'), leadController.getAll);
```

### Step C: The Guard (`authMiddleware`)
1. Verifies the Access Token.
2. Identifies the user: `req.user = { id: 'uuid-123' }`.

### Step D: The Enforcer (`authorize('lead.view')`)
This is where the magic happens (in `firstName/middleware/authorize.js`):

1. **Check Super Admin**: Is this user a Super Admin? If yes, **ALLOW**.
2. **Check Permissions**: The middleware runs a Database Query:
   ```sql
   -- Conceptual Query
   DOES (
     SELECT count(*) 
     FROM userRoles 
     JOIN rolePermissions ON userRoles.roleId = rolePermissions.roleId 
     JOIN permissions ON rolePermissions.permissionId = permissions.permissionId
     WHERE userId = 'uuid-123' AND permission.name = 'lead.view'
   ) > 0 ?
   ```
3. **Result**:
   - If count > 0: **ALLOW** (`next()`).
   - If count = 0: **DENY** (`403 Forbidden`).

## 3. Managing It (The "How To")

### Assigning Powers
To give a user power, you don't give them permissions directly. You:
1. Create a **Role** (e.g., "Manager") for their Company.
2. Assign **Permissions** to that Role (e.g., `lead.delete`, `user.view`).
3. Assign the **Role** to the **User**.

### Example Scenario
1. **New User "Alice" registers**.
   - She has no role yet (or maybe a default "Member" role with no powers).
   - She tries to view leads -> **403 Forbidden**.
2. **Admin assigns "Sales Rep" role to Alice**.
   - "Sales Rep" has `lead.view` permission.
3. **Alice tries to view leads again**.
   - Middleware checks DB -> Finds link -> **200 OK**.
