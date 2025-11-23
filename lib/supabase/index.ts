// Re-export clients and helpers for convenience
export { supabaseBrowser } from './browser';
export { supabaseServer } from './server';
export * from './helpers';

// Re-export legacy client for backward compatibility
export * from './client-legacy';
