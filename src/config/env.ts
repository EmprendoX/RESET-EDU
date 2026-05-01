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
  // Reserved for the next phase. Do not use in components yet.
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
  mentor: {
    endpoint: '/.netlify/functions/mentor-chat',
  },
} as const;
