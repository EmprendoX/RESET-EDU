import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loadCourseCatalogRows } from '@/lib/courses/loadCourseCatalogRows';
import { FullScreenSpinner, LoadingSkeleton } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StudentCourseCatalog } from '@/components/student/StudentCourseCatalog';
import { buildLoginUrl } from '@/lib/auth/loginRedirect';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * App Map §8.2 — `/mis-cursos`. Lista solo cursos a los que el alumno
 * tiene acceso (matriculado o gratis). Para descubrir cursos nuevos
 * existe `/cursos`.
 */
export function MyCoursesPage() {
  const location = useLocation();
  const { user, isAuthenticated, authReady } = useAuth();

  const q = useQuery({
    queryKey: ['student', 'mis-cursos', user.id, user.role],
    queryFn: () => loadCourseCatalogRows(user.id, user.role),
    enabled: authReady && isAuthenticated,
  });

  if (!authReady) {
    return <FullScreenSpinner label="Cargando sesión…" />;
  }
  if (!isAuthenticated) {
    if (isSupabaseConfigured()) {
      return (
        <Navigate
          to={buildLoginUrl(location.pathname, location.search)}
          replace
        />
      );
    }
    return <Navigate to="/" replace />;
  }

  if (q.isPending || q.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <LoadingSkeleton variant="sidebar" rows={4} />
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState
          title="No pudimos cargar tus cursos"
          onRetry={() => void q.refetch()}
        />
      </div>
    );
  }

  const rows = (q.data ?? []).filter((c) => c.hasAccess);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/dashboard" className="hover:text-slate-800">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-800">Mis cursos</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mis cursos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tus cursos en curso y completados. ¿Quieres añadir más?{' '}
            <Link
              to="/cursos"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Explora el catálogo
            </Link>
            .
          </p>
        </div>
      </header>

      <section className="space-y-3">
        {rows.length === 0 ? (
          <EmptyState
            title="Aún no estás inscrito en ningún curso"
            description="Cuando un admin te dé acceso a un curso, o cuando empieces uno gratis del catálogo, aparecerá aquí."
            action={
              <Link
                to="/cursos"
                className="focus-ring inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                Ver catálogo
              </Link>
            }
          />
        ) : (
          <StudentCourseCatalog courses={rows} />
        )}
      </section>
    </div>
  );
}
