import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both NEXT_PUBLIC_ (Vercel standard) and VITE_ (Vite standard) variable naming
const getEnvVar = (key: string): string => {
  // Vite client-side env
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv[key]) return metaEnv[key];
    if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
    if (metaEnv[`NEXT_PUBLIC_${key}`]) return metaEnv[`NEXT_PUBLIC_${key}`];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const supabaseUrl =
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  '';

const supabaseKey =
  getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase Client Initialized with URL:', supabaseUrl);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      clientInstance = null;
    }
  }
  return clientInstance;
};

export const supabase = getSupabase();
