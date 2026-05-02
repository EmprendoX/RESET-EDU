/**
 * Environment configuration.
 *
 * In the mock-data phase no env vars are required. Variables are declared here
 * so future features can read them without scattering `import.meta.env` across
 * the codebase.
 */

export const env = {
  appName: 'RESET EDU',
  isDev: import.meta.env.DEV,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
  /** Lectura de datos (p. ej. catálogo) desde Supabase; requiere esquema aplicado. */
  useSupabaseData: import.meta.env.VITE_USE_SUPABASE_DATA === 'true',
  mentor: {
    endpoint: '/.netlify/functions/mentor-chat',
  },
} as const;
