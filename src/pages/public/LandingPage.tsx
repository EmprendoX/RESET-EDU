import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { coursesRepo } from '@/lib/courses/coursesRepo';
import { LoadingSkeleton } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils/cn';
import type { PublishedCourseSummary } from '@/types/course';

/**
 * FR-001 — Homepage. Hero + cursos destacados + CTAs.
 * Los destacados vienen de Supabase (`is_featured = true`); si no hay, se
 * muestra un empty state para no romper el layout.
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

  const featuredQuery = useQuery({
    queryKey: ['public', 'courses', 'featured'],
    queryFn: () => coursesRepo.listFeaturedSummaries(6),
  });

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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-12">
      {signedOutBanner ? (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Sesión cerrada.
        </div>
      ) : null}

      <section className="flex flex-col items-center gap-6 pt-8 text-center">
        <img
          src="/Logot_Reset_Order.png"
          alt="RESET EDU"
          className="h-20 w-auto"
        />
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Resetea la forma en la que aprendes.
        </h1>
        <p className="text-balance max-w-prose text-lg font-medium text-slate-800 md:text-xl">
          Ordena tus ideas, enfoca tu energía y convierte cada curso en un plan de acción real.
        </p>
        <p className="text-balance max-w-prose text-base text-slate-600 md:text-lg">
          Cursos prácticos, herramientas simples y un mentor IA que te ayuda a entender, aplicar y avanzar paso a paso en tus proyectos.
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
                      Catálogo
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
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Cursos destacados
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Selección curada para empezar hoy mismo.
            </p>
          </div>
          <Link
            to="/cursos"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todos →
          </Link>
        </div>

        {featuredQuery.isLoading ? (
          <LoadingSkeleton variant="card" rows={3} />
        ) : featuredQuery.isError ? (
          <ErrorState
            title="No pudimos cargar los cursos destacados"
            onRetry={() => void featuredQuery.refetch()}
          />
        ) : (featuredQuery.data ?? []).length === 0 ? (
          <EmptyState
            title="Aún no hay cursos destacados"
            description="Pronto destacaremos algunos cursos. Mientras tanto, explora el catálogo completo."
            action={
              <Link
                to="/cursos"
                className="focus-ring inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                Ir al catálogo
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(featuredQuery.data ?? []).map((c) => (
              <FeaturedCourseCard key={c.id} row={c} />
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-slate-900">Cursos prácticos</h3>
          <p className="mt-1 text-sm text-slate-600">
            Texto, PDF y video, organizados por capítulos para que avances a tu
            ritmo.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Mentor IA aplicado</h3>
          <p className="mt-1 text-sm text-slate-600">
            Pregunta a tu mentor sobre la lección actual y aplícalo directamente
            a tu negocio.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Tu progreso, claro</h3>
          <p className="mt-1 text-sm text-slate-600">
            Lleva apuntes, marca lecciones completadas y guarda respuestas IA
            como notas.
          </p>
        </div>
      </section>

      <p className="pb-12 text-center text-xs text-slate-400">
        ¿Construyendo contenido?{' '}
        <Link to="/admin" className="text-brand-600 hover:text-brand-700">
          Panel admin
        </Link>
      </p>
    </main>
  );
}

function FeaturedCourseCard({ row }: { row: PublishedCourseSummary }) {
  return (
    <li className="surface-panel relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <Link to={`/cursos/${row.slug}`} className="focus-ring flex flex-1 flex-col">
        <div
          className={cn(
            'relative h-32 bg-slate-100 bg-cover bg-center',
            !row.cover_image_url && 'flex items-center justify-center',
          )}
          style={
            row.cover_image_url
              ? { backgroundImage: `url(${row.cover_image_url})` }
              : undefined
          }
        >
          {!row.cover_image_url ? (
            <Sparkles className="h-9 w-9 text-slate-300" aria-hidden />
          ) : null}
          {row.is_free === false ? (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              <Lock className="h-3 w-3" /> Premium
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-semibold leading-snug text-slate-900">
            {row.title}
          </h3>
          {row.short_description ? (
            <p className="line-clamp-2 text-sm text-slate-600">
              {row.short_description}
            </p>
          ) : null}
          <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
            <span>{row.lessonCount} lecciones</span>
            <span className="inline-flex items-center gap-1 font-medium text-brand-600">
              Ver curso <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
