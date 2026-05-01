/**
 * Placeholder for the future Supabase client.
 *
 * IMPORTANT: This file is intentionally NOT importing or instantiating Supabase
 * during the mock-data phase. Hooks must NEVER import this module yet.
 *
 * When Supabase is connected, this file will export a typed `supabase` client
 * built from environment variables (see `src/config/env.ts`). Until then,
 * it only documents the contract.
 */

export const SUPABASE_NOT_CONNECTED = true as const;

export interface SupabaseClientPlaceholder {
  readonly connected: false;
}

export const supabasePlaceholder: SupabaseClientPlaceholder = {
  connected: false,
};
