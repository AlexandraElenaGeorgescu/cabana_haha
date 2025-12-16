// Supabase Configuration
// Get these from: https://supabase.com/dashboard
// 1. Create a free account at https://supabase.com
// 2. Create a new project
// 3. Go to Settings > API
// 4. Copy your Project URL and anon/public key

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const hasSupabaseConfig = () => {
  return supabaseConfig.url.length > 0 && supabaseConfig.anonKey.length > 0;
};

