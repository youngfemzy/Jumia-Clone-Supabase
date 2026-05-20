import { createClient } from '@supabase/supabase-js';

const clean = (val: string | null | undefined): string => {
  if (!val) return '';
  // Strip quotes
  let cleaned = val.replace(/^["']|["']$/g, '').trim();
  // Check for configuration placeholders
  if (
    cleaned.includes('your-project-id') ||
    cleaned.includes('your-anon-key') ||
    cleaned.includes('your-publishable-key') ||
    cleaned === ''
  ) {
    return '';
  }
  return cleaned;
};

// Retrieve credentials purely from environment variables
const getSupabaseCredentials = () => {
  const envUrl = clean(import.meta.env.VITE_SUPABASE_URL);
  const envKey = clean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Debug configurations safely without exposing full secrets
  console.log('[Supabase Config Check]', {
    hasUrl: !!envUrl,
    hasKey: !!envKey,
    urlLength: envUrl?.length || 0,
    keyLength: envKey?.length || 0
  });

  return {
    url: envUrl,
    key: envKey,
    isCustom: false,
    isConfigured: !!(envUrl && envKey),
  };
};

export const { url: supabaseUrl, key: supabaseAnonKey, isConfigured, isCustom } = getSupabaseCredentials();

// Let's create a lazy-loaded Supabase client instance
let supabaseInstance: any = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const creds = getSupabaseCredentials();
    if (creds.isConfigured) {
      try {
        supabaseInstance = createClient(creds.url, creds.key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        });
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
      }
    }
  }
  return supabaseInstance;
};

// Check config state helper
export const checkSupabaseConnection = () => {
  return getSupabaseCredentials();
};

