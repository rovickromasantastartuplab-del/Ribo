-- ==========================================
-- CLEANUP: Remove trigger from auth.users
-- ==========================================
-- Trigger approach doesn't work on Supabase
-- (can't enable triggers on auth.users)
-- Using API-based registration instead
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Also clean up any orphaned auth users from failed attempts
-- (uncomment and modify the email if needed)
-- DELETE FROM auth.users WHERE email = 'your-test@email.com';
