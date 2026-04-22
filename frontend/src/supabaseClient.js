import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'your-anon-public-key-here') {
  console.error(
    '[Supabase] ❌ Missing or placeholder key in frontend/.env.local\n' +
    'Steps to fix:\n' +
    '  1. Go to https://supabase.com/dashboard → your project\n' +
    '  2. Settings → API\n' +
    '  3. Copy the "Publishable" key (starts with sb_publishable_...)\n' +
    '     OR the "anon / public" key (starts with eyJ...)\n' +
    '  4. Paste it as VITE_SUPABASE_ANON_KEY in frontend/.env.local\n' +
    '  5. Restart: npm run dev\n' +
    'Current URL:', supabaseUrl || '❌ MISSING'
  );
} else {
  console.log('[Supabase] ✅ Client initialised →', supabaseUrl);
}

// No fallback — we want real errors if misconfigured
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

