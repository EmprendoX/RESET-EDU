import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.supabase.url?.trim() && env.supabase.anonKey?.trim(),
  );
}

/**
 * Cliente browser; solo se crea si hay URL y anon key. Sin env válido devuelve `null`
 * (la app sigue en modo mock).
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

/** Compat: `true` cuando no hay credenciales Supabase en env. */
export const SUPABASE_NOT_CONNECTED = !isSupabaseConfigured();
