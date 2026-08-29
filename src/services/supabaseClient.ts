import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigDiagnostics {
  isConfigured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  urlValue: string;
  keyPreview: string;
  source: string;
  statusMessage: string;
}

// Safely resolve environment variables with explicit static access for Vite and Next.js / Vercel
function resolveSupabaseCredentials(): { url: string; key: string; source: string } {
  let url = '';
  let key = '';
  let source = 'none';

  // 1. Check Vite import.meta.env (static and direct)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const meta = import.meta.env as Record<string, string | undefined>;
      url =
        meta.NEXT_PUBLIC_SUPABASE_URL ||
        meta.VITE_SUPABASE_URL ||
        meta.SUPABASE_URL ||
        '';

      key =
        meta.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        meta.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        meta.VITE_SUPABASE_ANON_KEY ||
        meta.VITE_SUPABASE_PUBLISHABLE_KEY ||
        meta.SUPABASE_ANON_KEY ||
        '';

      if (url || key) {
        source = 'import.meta.env';
      }
    }
  } catch {
    // Ignore runtime access issue in non-Vite contexts
  }

  // 2. Check Node / Server process.env fallback
  if (!url || !key) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (!url) {
          url =
            process.env.NEXT_PUBLIC_SUPABASE_URL ||
            process.env.VITE_SUPABASE_URL ||
            process.env.SUPABASE_URL ||
            '';
        }
        if (!key) {
          key =
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
            process.env.VITE_SUPABASE_ANON_KEY ||
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            '';
        }
        if ((url || key) && source === 'none') {
          source = 'process.env';
        }
      }
    } catch {
      // Ignore
    }
  }

  return { url: (url || '').trim(), key: (key || '').trim(), source };
}

const { url: resolvedUrl, key: resolvedKey, source: credentialSource } = resolveSupabaseCredentials();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(resolvedUrl && resolvedKey && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')));
};

export const getSupabaseConfigDiagnostics = (): SupabaseConfigDiagnostics => {
  const hasUrl = Boolean(resolvedUrl);
  const hasKey = Boolean(resolvedKey);
  const isValidUrl = hasUrl && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'));
  const configured = Boolean(hasUrl && hasKey && isValidUrl);

  let statusMessage = '';
  if (configured) {
    statusMessage = `Supabase credentials detected via ${credentialSource} (${resolvedUrl.replace(/^https?:\/\//, '').slice(0, 24)}...)`;
  } else if (!hasUrl && !hasKey) {
    statusMessage = 'Missing both Supabase URL (NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL) and API Key (NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY)';
  } else if (!hasUrl) {
    statusMessage = 'Missing Supabase URL (NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL)';
  } else if (!hasKey) {
    statusMessage = 'Missing Supabase Anon/Publishable API Key (NEXT_PUBLIC_SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY)';
  } else if (!isValidUrl) {
    statusMessage = `Invalid Supabase URL format "${resolvedUrl}" (Must start with https:// or http://)`;
  }

  return {
    isConfigured: configured,
    hasUrl,
    hasKey,
    urlValue: resolvedUrl ? `${resolvedUrl.slice(0, 30)}...` : '',
    keyPreview: resolvedKey ? `${resolvedKey.slice(0, 8)}...${resolvedKey.slice(-4)}` : '',
    source: credentialSource,
    statusMessage,
  };
};

let clientInstance: SupabaseClient | null = null;
let hasLoggedStartup = false;

export const getSupabase = (): SupabaseClient | null => {
  const diagnostics = getSupabaseConfigDiagnostics();

  if (!diagnostics.isConfigured) {
    if (!hasLoggedStartup && typeof window !== 'undefined') {
      hasLoggedStartup = true;
      console.warn('⚠️ [Supabase Startup Check] getSupabase() returned null. Reason:', diagnostics.statusMessage);
      console.info('ℹ️ Running in Local Storage Mode (Offline-first & standalone persistence).');
    }
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(resolvedUrl, resolvedKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      if (!hasLoggedStartup) {
        hasLoggedStartup = true;
        console.log('✅ [Supabase Startup Check] Client initialized successfully with URL:', resolvedUrl);
      }
    } catch (err: any) {
      console.error('❌ [Supabase Startup Check] Failed to initialize Supabase client instance:', err);
      clientInstance = null;
    }
  }

  return clientInstance;
};

export const supabase = getSupabase();

