import type { AuthError } from '@supabase/supabase-js';

function isAuthError(e: unknown): e is AuthError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as AuthError).message === 'string'
  );
}

/**
 * Mensajes en español para errores típicos de Supabase Auth.
 */
export function mapAuthError(error: unknown): string {
  if (!error) return 'Ocurrió un error inesperado.';

  const msg = isAuthError(error)
    ? error.message
    : error instanceof Error
      ? error.message
      : String(error);

  const lower = msg.toLowerCase();

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    msg === 'Invalid login credentials'
  ) {
    return 'Correo o contraseña incorrectos.';
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('not confirmed')
  ) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered') ||
    lower.includes('already exists')
  ) {
    return 'Ese correo ya está registrado. Inicia sesión o usa otro correo.';
  }

  if (
    lower.includes('password') &&
    (lower.includes('weak') || lower.includes('short') || lower.includes('least'))
  ) {
    return 'La contraseña no cumple los requisitos de seguridad. Usa una más larga.';
  }

  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Error de red. Revisa tu conexión e inténtalo de nuevo.';
  }

  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  }

  return msg.length > 0 && msg.length < 200
    ? msg
    : 'No se pudo completar la operación. Inténtalo de nuevo.';
}
