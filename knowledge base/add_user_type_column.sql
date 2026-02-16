-- ==========================================
-- ADD TYPE COLUMN TO USERS TABLE
-- ==========================================
-- This migration adds a secure type column to identify
-- superadmins vs company users vs regular users
-- ==========================================

-- Step 1: Add type column with default value
ALTER TABLE "users" 
ADD COLUMN "type" VARCHAR(20) DEFAULT 'user' 
CHECK ("type" IN ('superadmin', 'company', 'user'));

-- Step 2: Create index for performance
CREATE INDEX "idx_users_type" ON "users"("type");

-- Step 3: Update existing users to 'company' type if they are company owners
-- (Assuming users with no createdBy are company owners)
UPDATE "users" 
SET "type" = 'company' 
WHERE "createdBy" IS NULL;

-- Step 4: Verify the changes
SELECT 
  "userId",
  "name",
  email,
  "type",
  "companyId",
  "createdBy"
FROM "users"
ORDER BY "type", "createdAt";

-- ==========================================
-- NOTES
-- ==========================================
-- After running this migration:
-- 1. All existing users will have type = 'company' (if no createdBy) or 'user'
-- 2. To create a superadmin, manually set type = 'superadmin'
-- 3. The type column is protected by CHECK constraint
-- 4. Only superadmins should be able to modify the type column (enforce in backend)
