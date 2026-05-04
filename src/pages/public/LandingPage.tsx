import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Punto de entrada: demo sin Supabase env; con env, enlaces a login y sesión real.
 */
export function LandingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, authReady } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const signedOutBanner = searchParams.get('signedOut') === '1';

  useEffect(() => {
    if (!signedOutBanner) return;
    const next = new URLSearchParams(searchParams);
    next.delete('signedOut');
    setSearchParams(next, { replace: true });
  }, [signedOutBanner, searchParams, setSearchParams]);

  const supabaseMode = isSupabaseConfigured();

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    setSigningOut(true);
    try {
      await sb.auth.signOut();
      navigate('/?signedOut=1', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      {signedOutBanner ? (
        <div
          className="w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Sesión cerrada.
        </div>
      ) : null}

      <div className="inline-flex items-center gap-2 rounded-full border border-ai-100 bg-ai-50 px-3 py-1 text-xs font-medium text-ai-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        {supabaseMode ? 'RESET EDU' : 'Demo del Aula Inteligente — sin backend'}
      </div>
      <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        Aprende con cursos prácticos y un mentor IA aplicado a tu negocio.
      </h1>
      <p className="text-balance max-w-prose text-base text-slate-600 md:text-lg">
        {supabaseMode
          ? 'Inicia sesión para acceder a tu aula y dashboard.'
          : 'Esta vista es el punto de entrada al Aula en modo demo.'}
      </p>

      {supabaseMode && authReady ? (
        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {isAuthenticated ? (
            <>
              <p className="text-sm text-slate-600">
                Conectado como{' '}
                <span className="font-medium text-slate-900">
                  {user.full_name || user.email || 'usuario'}
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/cursos">
                  <Button size="md" variant="outline">
                    Catálogo de cursos
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="md" variant="primary">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  loading={signingOut}
                  onClick={() => void handleSignOut()}
                >
                  Cerrar sesión
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/cursos">
                <Button size="lg" variant="outline">
                  Ver cursos
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="primary">
                  Entrar
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Link to="/aprender/marketing-con-ia">
          <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Abrir Aula de demo
          </Button>
        </Link>
        <Link
          to="/cursos"
          className="focus-ring text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
        >
          Catálogo
        </Link>
        <Link
          to="/dashboard"
          className="focus-ring text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Dashboard alumno
        </Link>
        <Link
          to="/mi-negocio"
          className="focus-ring text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
        >
          Mi negocio
        </Link>
      </div>
      <p className="text-xs text-slate-400">
        ¿Construyendo contenido?{' '}
        <Link to="/admin" className="text-brand-600 hover:text-brand-700">
          Panel admin (demo)
        </Link>
      </p>
    </main>
  );
}
