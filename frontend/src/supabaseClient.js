import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are properly configured
if (!supabaseUrl || supabaseUrl === 'your-supabase-project-url' || 
    !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn('Supabase credentials are not properly configured in .env.local');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
