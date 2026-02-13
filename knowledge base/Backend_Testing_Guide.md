# Backend Testing Guide (Thunder Client)

## ⚡ Prerequisites
1.  Ensure your server is running (`npm run dev` in `server/`).
2.  Install **Thunder Client** extension in VS Code.

---

## 🔐 Step 1: Authentication (Get Token)
Since the dashboard is protected, you must login first to get an Access Token.

1.  **New Request:** `POST`
2.  **URL:** `http://localhost:4000/api/auth/login`
3.  **Body (JSON):**
    ```json
    {
      "email": "rovick@ribo.com", 
      "password": "password123"
    }
    ```
    *(Replace with an actual user email you registered)*

4.  **Send Request.**
5.  **Copy Token:** In the response JSON, look for `session.access_token`. Copy this long string.

---

## 📊 Step 2: Test Dashboard Endpoints

### 1. Dashboard Summary
1.  **New Request:** `GET`
2.  **URL:** `http://localhost:4000/api/dashboard/summary`
3.  **Auth Tab:**
    - Click **Auth** -> Select **Bearer Token**.
    - Paste your `access_token` into the Token field.
4.  **Send Request.**
5.  **Expected Result:**
    ```json
    {
      "succes": true,
      "data": {
        "totalLeads": 0,
        "totalSales": 0,
        "totalCustomers": 0,
        "totalProjects": 0
      }
    }
    ```

### 2. Revenue Analytics
1.  **New Request:** `GET`
2.  **URL:** `http://localhost:4000/api/dashboard/revenue`
3.  **Auth Tab:** Use Bearer Token (same as above).
4.  **Send Request.**
5.  **Expected Result:** An array of monthly revenue (likely empty `[]` if no paid invoices exist).

### 3. Recent Activity
1.  **New Request:** `GET`
2.  **URL:** `http://localhost:4000/api/dashboard/recent-activity`
3.  **Auth Tab:** Use Bearer Token.
4.  **Send Request.**
5.  **Expected Result:** A combined list of recent leads and logins (likely empty `[]` initially).

---

## 🛠️ Troubleshooting
- **401 Unauthorized:** Your token is missing, expired, or invalid. Re-login and paste the new token.
- **500 Server Error:** Check the terminal logs for details.
