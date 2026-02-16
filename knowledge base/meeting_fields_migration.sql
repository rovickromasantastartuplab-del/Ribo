-- Add missing fields to meetings table for parent module linking and multi-user assignment

-- Add parentModule field (nullable, can link to lead/account/contact/opportunity)
ALTER TABLE "meetings" 
ADD COLUMN "parentModule" VARCHAR(20) NULL DEFAULT NULL 
CHECK ("parentModule" IN ('lead', 'account', 'contact', 'opportunity'));

-- Add parentId field (nullable, UUID of the parent record)
ALTER TABLE "meetings" 
ADD COLUMN "parentId" UUID NULL DEFAULT NULL;

-- Add index for parent module queries
CREATE INDEX "idx_meetings_parent" ON "meetings"("parentModule", "parentId");

-- Create pivot table for multi-user assignment (like leads, accounts, opportunities)
CREATE TABLE "meetingAssignments" (
  "meetingId" UUID NOT NULL REFERENCES "meetings"("meetingId") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "users"("userId") ON DELETE CASCADE,
  "assignedAt" TIMESTAMPTZ DEFAULT NOW(),
  "assignedBy" UUID NULL DEFAULT NULL REFERENCES "users"("userId") ON DELETE SET NULL,
  PRIMARY KEY ("meetingId", "userId")
);

CREATE INDEX "idx_meeting_assignments_meeting_id" ON "meetingAssignments"("meetingId");
CREATE INDEX "idx_meeting_assignments_user_id" ON "meetingAssignments"("userId");

-- Note: parentId is intentionally not a foreign key because it can reference different tables
-- (leads, accounts, contacts, opportunities) depending on parentModule value
