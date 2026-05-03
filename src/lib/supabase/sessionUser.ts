import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resuelve el usuario autenticado en el cliente browser (JWT en sesión).
 * Sin sesión devuelve null — los repos Supabase usan esto para lecturas vacías
 * o para lanzar error en escrituras (la UI con Supabase suele exigir login antes).
 */
export async function getSessionUserId(
  client: SupabaseClient,
): Promise<string | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

export function requireSessionUserId(userId: string | null): string {
  if (!userId) {
    throw new Error('No hay sesión. Inicia sesión para continuar.');
  }
  return userId;
}
