import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // Don't store tokens in localStorage
        autoRefreshToken: false, // Backend handles token refresh via cookies
        detectSessionInUrl: false // Don't detect session from URL (OAuth callbacks)
    }
});
