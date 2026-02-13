
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Define Permissions (Based on Reference Project & Schema)
const modules = {
    // 1. Dashboard
    'dashboard': ['view'],

    // 2. Staff Management
    'user': ['view', 'create', 'edit', 'delete'],
    'role': ['view', 'create', 'edit', 'delete'],

    // 3. Lead Management
    'lead': ['view', 'create', 'edit', 'delete', 'convert', 'import', 'export'],
    'leadStatus': ['view', 'create', 'edit', 'delete'],
    'leadSource': ['view', 'create', 'edit', 'delete'],

    // 4. Opportunity Management
    'opportunity': ['view', 'create', 'edit', 'delete'],
    'opportunityStage': ['view', 'create', 'edit', 'delete'],
    'opportunitySource': ['view', 'create', 'edit', 'delete'],

    // 5. Account Management
    'account': ['view', 'create', 'edit', 'delete', 'import', 'export'],
    'accountType': ['view', 'create', 'edit', 'delete'],
    'accountIndustry': ['view', 'create', 'edit', 'delete'],

    // 6. Contact Management
    'contact': ['view', 'create', 'edit', 'delete', 'import', 'export'],

    // 7. Invoice Management
    'invoice': ['view', 'create', 'edit', 'delete', 'send', 'download'],
    'tax': ['view', 'create', 'edit', 'delete'],
    'currency': ['view', 'create', 'edit', 'delete'],

    // 8. Document Management
    'document': ['view', 'create', 'edit', 'delete', 'download'],
    'documentFolder': ['view', 'create', 'edit', 'delete'],

    // 9. Campaign Management
    'campaign': ['view', 'create', 'edit', 'delete'],
    'campaignType': ['view', 'create', 'edit', 'delete'],

    // 10. Calendar & Activity
    'calendar': ['view', 'manage'],
    'meeting': ['view', 'create', 'edit', 'delete'],
    'call': ['view', 'create', 'edit', 'delete', 'log'],
    'task': ['view', 'create', 'edit', 'delete'],

    // 11. Reports
    'report': ['view', 'export'],

    // 12. Plans & Subscriptions
    'plan': ['view', 'create', 'edit', 'delete'],
    'planRequest': ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
    'planOrder': ['view', 'create', 'edit', 'delete', 'approve', 'reject'],
    'coupon': ['view', 'create', 'edit', 'delete'],

    // 13. Media Library
    'media': ['view', 'create', 'edit', 'delete', 'upload'],

    // 14. Referral Program
    'referral': ['view', 'create', 'edit', 'delete', 'approve', 'reject'],

    // 15. Notification Templates
    'notificationTemplate': ['view', 'create', 'edit', 'delete', 'send'],

    // 16. Settings
    'setting': ['view', 'edit'],
    'company': ['view', 'create', 'edit', 'delete', 'suspend'], // Super Admin feature
    'landingPage': ['view', 'edit'], // Super Admin feature
};

const seed = async () => {
    console.log('🌱 Starting Permission Seeding...');

    // 1. Create Permissions
    let permissionList = [];
    for (const [module, actions] of Object.entries(modules)) {
        for (const action of actions) {
            permissionList.push({
                name: `${module}.${action}`,
                module: module,
                guardName: 'web',
                label: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`
            });
        }
    }

    // Upsert Permissions (avoid duplicates)
    // Supabase .upsert() works if there is a UNIQUE constraint. 
    // Our schema has UNIQUE("name") on permissions table.
    const { data: createdPermissions, error: permError } = await supabase
        .from('permissions')
        .upsert(permissionList, { onConflict: 'name' })
        .select();

    if (permError) {
        console.error('❌ Error seeding permissions:', permError);
        return;
    }
    console.log(`✅ Seeded ${createdPermissions.length} permissions.`);

    // 2. Create Default Roles (Optional: if you want global default roles not tied to a company)
    // In our schema, roles are tied to ONE company (companyId NOT NULL).
    // So we can't seed "global" roles easily unless we pick a dummy company or just skip this.
    // However, the "Super Admin" logic bypasses roles, so we are good there.

    // We will verify by just listing what we have.
    console.log('✅ Permission seeding complete. Roles are company-specific and will be created during onboarding.');
};

seed();
