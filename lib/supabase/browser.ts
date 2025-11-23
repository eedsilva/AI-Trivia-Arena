import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from '../config';

// Lazy initialization to prevent build-time errors when env vars are not set
let _supabaseBrowser: SupabaseClient | null = null;

export const supabaseBrowser = (): SupabaseClient => {
  if (!_supabaseBrowser) {
    const { url, anonKey } = envConfig.supabase;
    if (!url || !anonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    _supabaseBrowser = createClient(url, anonKey);
  }
  return _supabaseBrowser;
};
