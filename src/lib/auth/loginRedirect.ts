/**
 * Construye URL de login con destino post-auth. `pathname` debe incluir leading `/`.
 */
export function buildLoginUrl(pathname: string, search = ''): string {
  const full = `${pathname}${search}`;
  return `/login?next=${encodeURIComponent(full)}`;
}

const DEFAULT_AFTER_LOGIN = '/dashboard';

/**
 * Evita open redirect: solo rutas relativas internas que empiezan por `/` y no `//`.
 */
export function getSafeNextParam(next: string | null | undefined): string {
  if (!next || typeof next !== 'string') return DEFAULT_AFTER_LOGIN;
  const t = next.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return DEFAULT_AFTER_LOGIN;
  if (t.includes('://')) return DEFAULT_AFTER_LOGIN;
  return t;
}
