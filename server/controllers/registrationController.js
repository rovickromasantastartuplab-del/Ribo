import { supabase, createAuthClient } from '../config/db.js';

/**
 * Complete user registration by creating company, user, role, and default data
 * This replaces the database trigger approach
 */
export const completeRegistration = async (req, res) => {
    const { access_token, refresh_token, name, email } = req.body;

    if (!access_token || !refresh_token) {
        return res.status(400).json({ error: 'Missing authentication tokens' });
    }

    try {
        // 1. Verify the user with Supabase
        const authClient = createAuthClient(access_token);
        const { data: { user }, error: authError } = await authClient.auth.getUser();

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid authentication' });
        }

        // 2. Check if user already has a company (already registered)
        const { data: existingUser } = await supabase
            .from('users')
            .select('userId, companyId')
            .eq('authUserId', user.id)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        }

        // 3. Get the default/trial plan
        const { data: defaultPlan, error: planError } = await supabase
            .from('plans')
            .select('planId, storageLimit')
            .or('isDefault.eq.true,isTrial.eq.true')
            .order('isTrial', { ascending: false })
            .order('isDefault', { ascending: false })
            .limit(1)
            .single();

        if (planError || !defaultPlan) {
            return res.status(500).json({ error: 'No default plan found' });
        }

        // 4. Get or Create company
        let company;
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('*')
            .eq('email', email)
            .single();

        if (existingCompany) {
            company = existingCompany;
        } else {
            const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert({
                    name: `${name || email.split('@')[0]}'s Company`,
                    email: email
                })
                .select()
                .single();

            if (companyError) {
                console.error('Company creation error:', companyError);
                return res.status(500).json({ error: 'Failed to create company' });
            }
            company = newCompany;
        }

        // 5. Create user record
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
                userId: user.id,
                authUserId: user.id,
                companyId: company.companyId,
                name: name || email.split('@')[0],
                email: email
            })
            .select()
            .single();

        if (userError) {
            console.error('User creation error:', userError);
            // Rollback: delete company
            await supabase.from('companies').delete().eq('companyId', company.companyId);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // 6. Get or Create Company role
        let companyRole;
        const { data: existingRole } = await supabase
            .from('roles')
            .select('*')
            .eq('companyId', company.companyId)
            .eq('name', 'Company')
            .single();

        if (existingRole) {
            companyRole = existingRole;
        } else {
            const { data: newRole, error: roleError } = await supabase
                .from('roles')
                .insert({
                    companyId: company.companyId,
                    name: 'Company',
                    guardName: 'web',
                    label: 'Company',
                    description: 'Company owner with full access',
                    createdBy: newUser.userId
                })
                .select()
                .single();

            if (roleError) {
                console.error('Role creation error:', roleError);
                return res.status(500).json({ error: 'Failed to create company role' });
            }
            companyRole = newRole;

            // 8. Grant all permissions to Company role (Only for NEW role)
            const { data: permissions, error: permissionsError } = await supabase
                .from('permissions')
                .select('permissionId');

            if (!permissionsError && permissions) {
                const rolePermissions = permissions.map(p => ({
                    roleId: companyRole.roleId,
                    permissionId: p.permissionId
                }));

                await supabase.from('rolePermissions').insert(rolePermissions);
            }
        }

        // 7. Assign Company role to user (Always assign)
        const { error: userRoleError } = await supabase
            .from('userRoles')
            .insert({
                userId: newUser.userId,
                roleId: companyRole.roleId
            });

        if (userRoleError) {
            console.error('User role assignment error:', userRoleError);
            return res.status(500).json({ error: 'Failed to assign role' });
        }

        // 9. Create subscription (Only if NEW company or NO active sub?)
        // For simplicity, skip if company existed (assume it has sub)
        if (!existingCompany) {
            const { error: subscriptionError } = await supabase
                .from('subscriptions')
                .insert({
                    companyId: company.companyId,
                    planId: defaultPlan.planId,
                    startDate: new Date().toISOString().split('T')[0],
                    isActive: true,
                    storageLimit: defaultPlan.storageLimit || 0
                });

            if (subscriptionError) {
                console.error('Subscription creation error:', subscriptionError);
            }

            // 10. Seed default Lead Statuses
            const leadStatuses = [
                { name: 'New', color: '#3B82F6' },
                { name: 'Contacted', color: '#F59E0B' },
                { name: 'Qualified', color: '#10B981' },
                { name: 'Lost', color: '#EF4444' }
            ];

            await supabase.from('leadStatuses').insert(
                leadStatuses.map(status => ({
                    companyId: company.companyId,
                    name: status.name,
                    color: status.color,
                    status: 'active',
                    createdBy: newUser.userId
                }))
            );

            // 11. Seed default Opportunity Stages
            const opportunityStages = [
                { name: 'Prospecting', probability: 10, color: '#3B82F6' },
                { name: 'Qualification', probability: 25, color: '#8B5CF6' },
                { name: 'Proposal', probability: 50, color: '#F59E0B' },
                { name: 'Negotiation', probability: 75, color: '#10B981' },
                { name: 'Closed Won', probability: 100, color: '#059669' },
                { name: 'Closed Lost', probability: 0, color: '#EF4444' }
            ];

            await supabase.from('opportunityStages').insert(
                opportunityStages.map(stage => ({
                    companyId: company.companyId,
                    name: stage.name,
                    probability: stage.probability,
                    color: stage.color,
                    status: 'active',
                    createdBy: newUser.userId
                }))
            );
        }

        // 12. Return success
        res.json({
            success: true,
            user: {
                userId: newUser.userId,
                name: newUser.name,
                email: newUser.email,
                companyId: company.companyId,
                companyName: company.name
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
