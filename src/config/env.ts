/**
 * Environment configuration.
 *
 * In the mock-data phase no env vars are required. Variables are declared here
 * so future features can read them without scattering `import.meta.env` across
 * the codebase.
 */

/** Solo `https:` con host; usada p. ej. para `emailRedirectTo` en registro. */
function parsePublicAppOrigin(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:' || !u.hostname) return null;
    return u.origin;
  } catch {
    return null;
  }
}

export const env = {
  appName: 'RESET EDU',
  isDev: import.meta.env.DEV,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
  /** Lectura de datos (p. ej. catálogo) desde Supabase; requiere esquema aplicado. */
  useSupabaseData: import.meta.env.VITE_USE_SUPABASE_DATA === 'true',
  /**
   * Origen público de la app (solo https). Si es null, auth signup usa `window.location.origin`.
   * Debe coincidir con una entrada en Supabase → Authentication → URL configuration → Redirect URLs.
   */
  publicAppOrigin: parsePublicAppOrigin(
    import.meta.env.VITE_PUBLIC_APP_URL as string | undefined,
  ),
  mentor: {
    endpoint: '/.netlify/functions/mentor-chat',
  },
} as const;
