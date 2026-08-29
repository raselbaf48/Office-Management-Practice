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
export function resolveSupabaseCredentials(): { url: string; key: string; source: string } {
  let url = '';
  let key = '';
  let source = 'none';

  // 1. Check in-app local storage override first
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUrl = window.localStorage.getItem('baf_supabase_url');
      const storedKey = window.localStorage.getItem('baf_supabase_anon_key');
      if (storedUrl && storedKey) {
        url = storedUrl;
        key = storedKey;
        source = 'In-App Settings (localStorage)';
      }
    }
  } catch {
    // Ignore
  }

  // 2. Check Vite import.meta.env (static and direct)
  if (!url || !key) {
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
  }

  // 3. Check Node / Server process.env fallback
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

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = resolveSupabaseCredentials();
  return Boolean(url && key && (url.startsWith('http://') || url.startsWith('https://')));
};

export const getSupabaseConfigDiagnostics = (): SupabaseConfigDiagnostics => {
  const { url: resolvedUrl, key: resolvedKey, source: credentialSource } = resolveSupabaseCredentials();
  const hasUrl = Boolean(resolvedUrl);
  const hasKey = Boolean(resolvedKey);
  const isValidUrl = hasUrl && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'));
  const configured = Boolean(hasUrl && hasKey && isValidUrl);

  let statusMessage = '';
  if (configured) {
    statusMessage = `Supabase credentials active via ${credentialSource} (${resolvedUrl.replace(/^https?:\/\//, '').slice(0, 24)}...)`;
  } else if (!hasUrl && !hasKey) {
    statusMessage = 'Missing both Supabase URL and API Key. You can configure them in Cloudflare Settings or directly in App Settings.';
  } else if (!hasUrl) {
    statusMessage = 'Missing Supabase URL (e.g. https://xyz.supabase.co)';
  } else if (!hasKey) {
    statusMessage = 'Missing Supabase Anon/Publishable API Key (anon key)';
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
let lastUsedUrl = '';
let lastUsedKey = '';
let hasLoggedStartup = false;

export const getSupabase = (): SupabaseClient | null => {
  const { url: resolvedUrl, key: resolvedKey } = resolveSupabaseCredentials();
  const diagnostics = getSupabaseConfigDiagnostics();

  if (!diagnostics.isConfigured) {
    if (!hasLoggedStartup && typeof window !== 'undefined') {
      hasLoggedStartup = true;
      console.warn('⚠️ [Supabase Startup Check] getSupabase() returned null. Reason:', diagnostics.statusMessage);
      console.info('ℹ️ Running in Local Storage Mode (Offline-first & standalone persistence).');
    }
    clientInstance = null;
    return null;
  }

  if (!clientInstance || lastUsedUrl !== resolvedUrl || lastUsedKey !== resolvedKey) {
    try {
      clientInstance = createClient(resolvedUrl, resolvedKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      lastUsedUrl = resolvedUrl;
      lastUsedKey = resolvedKey;
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

export const saveCustomSupabaseCredentials = (url: string, key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (url && key) {
        window.localStorage.setItem('baf_supabase_url', url.trim());
        window.localStorage.setItem('baf_supabase_anon_key', key.trim());
      } else {
        window.localStorage.removeItem('baf_supabase_url');
        window.localStorage.removeItem('baf_supabase_anon_key');
      }
      clientInstance = null;
      window.dispatchEvent(new CustomEvent('supabase_sync_update'));
      window.dispatchEvent(new CustomEvent('baf_state_updated'));
      return true;
    }
  } catch (e) {
    console.error('Error saving supabase credentials to localStorage:', e);
  }
  return false;
};

export const clearCustomSupabaseCredentials = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('baf_supabase_url');
      window.localStorage.removeItem('baf_supabase_anon_key');
      clientInstance = null;
      window.dispatchEvent(new CustomEvent('supabase_sync_update'));
      window.dispatchEvent(new CustomEvent('baf_state_updated'));
    }
  } catch (e) {
    console.error('Error clearing supabase credentials:', e);
  }
};

export const supabase = getSupabase();

