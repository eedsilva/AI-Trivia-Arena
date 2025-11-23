import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from '../config';

// Lazy initialization to prevent build-time errors when env vars are not set
let _supabaseServer: SupabaseClient | null = null;

export const supabaseServer = (): SupabaseClient => {
  if (!_supabaseServer) {
    const { url, serviceRoleKey } = envConfig.supabase;
    if (!url || !serviceRoleKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _supabaseServer = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseServer;
};
