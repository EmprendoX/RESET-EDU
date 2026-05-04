import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useState } from 'react';

/**
 * Navegación mínima para páginas públicas (catálogo, detalle de curso).
 */
export function PublicSiteHeader() {
  const { user, isAuthenticated, authReady } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const supabaseMode = isSupabaseConfigured();

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    setSigningOut(true);
    try {
      await sb.auth.signOut();
      window.location.assign('/?signedOut=1');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          to="/"
          className="text-sm font-semibold text-slate-900 hover:text-brand-700"
        >
          RESET EDU
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/cursos"
            className="font-medium text-slate-600 transition hover:text-slate-900"
          >
            Cursos
          </Link>
          {authReady && isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="font-medium text-slate-600 transition hover:text-slate-900"
              >
                Mi aula
              </Link>
              {user.role === 'course_admin' || user.role === 'superadmin' ? (
                <Link
                  to="/admin"
                  className="font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Admin
                </Link>
              ) : null}
              {supabaseMode ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                >
                  {signingOut ? 'Saliendo…' : 'Salir'}
                </Button>
              ) : null}
            </>
          ) : (
            <>
              {supabaseMode ? (
                <Link to="/login">
                  <Button type="button" size="sm" variant="primary" className="h-8">
                    Iniciar sesión
                  </Button>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="font-medium text-brand-600 hover:text-brand-800"
                >
                  Entrar (demo)
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
