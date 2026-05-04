import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loadCourseCatalogRows } from '@/lib/courses/loadCourseCatalogRows';
import { queryKeys } from '@/hooks/queryKeys';
import { FullScreenSpinner } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StudentCourseCatalog } from '@/components/student/StudentCourseCatalog';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';
import { EmptyState } from '@/components/common/EmptyState';

export function CourseCatalogPage() {
  const { user, authReady } = useAuth();

  const q = useQuery({
    queryKey: queryKeys.catalog.rowsForUser(user.id, user.role),
    queryFn: () => loadCourseCatalogRows(user.id, user.role),
    enabled: authReady,
  });

  if (!authReady) {
    return (
      <>
        <PublicSiteHeader />
        <FullScreenSpinner label="Cargando…" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <PublicSiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-800">
            Inicio
          </Link>
          <span aria-hidden className="text-slate-400">
            /
          </span>
          <span className="text-slate-800">Cursos</span>
        </nav>

        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Catálogo de cursos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Explora lo publicado. Con acceso podrás continuar en el aula; si un
            curso es de pago, necesitas matrícula activa.
          </p>
        </header>

        {q.isPending ? (
          <LoadingSkeleton variant="sidebar" rows={4} />
        ) : q.isError ? (
          <ErrorState
            title="No pudimos cargar el catálogo"
            onRetry={() => void q.refetch()}
          />
        ) : !q.data?.length ? (
          <EmptyState
            title="Sin cursos publicados"
            description="Cuando se publiquen cursos aparecerán aquí."
          />
        ) : (
          <StudentCourseCatalog courses={q.data} />
        )}
      </main>
    </div>
  );
}
