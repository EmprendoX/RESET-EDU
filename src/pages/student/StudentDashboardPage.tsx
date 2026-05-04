import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight, NotebookPen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { loadCourseCatalogRows } from '@/lib/courses/loadCourseCatalogRows';
import { notesRepo } from '@/lib/notes/notesRepo';
import { MOCK_COURSE_SLUG } from '@/data/mockClassroomData';
import type { Note } from '@/types/notes';
import type { UserRole } from '@/types/auth';
import { FullScreenSpinner, LoadingSkeleton } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  StudentCourseCatalog,
  type CourseCatalogRow,
} from '@/components/student/StudentCourseCatalog';
import { buildLoginUrl } from '@/lib/auth/loginRedirect';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface DashboardPayload {
  courses: CourseCatalogRow[];
  notes: Note[];
  slugByCourseId: Record<string, string>;
}

async function loadDashboard(
  userId: string,
  role: UserRole,
): Promise<DashboardPayload> {
  const courses = await loadCourseCatalogRows(userId, role);
  const notes = await notesRepo.listRecent(8);
  const slugByCourseId = Object.fromEntries(
    courses.map((c) => [c.id, c.slug]),
  );

  return { courses, notes, slugByCourseId };
}

function noteHref(note: Note, slugByCourseId: Record<string, string>): string {
  const slug = slugByCourseId[note.course_id] ?? MOCK_COURSE_SLUG;
  if (note.lesson_id) {
    return `/aprender/${slug}/${note.lesson_id}`;
  }
  return `/aprender/${slug}`;
}

export function StudentDashboardPage() {
  const location = useLocation();
  const { user, isAuthenticated, authReady } = useAuth();
  const { profile, isLoading: profileLoading } = useBusinessProfile();

  const q = useQuery({
    queryKey: ['student', 'dashboard', user.id, user.role],
    queryFn: () => loadDashboard(user.id, user.role),
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

  const profileIncomplete =
    profile &&
    (!profile.business_name.trim() || !profile.industry.trim());

  if (q.isPending || q.isLoading || profileLoading) {
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
          title="No pudimos cargar tu dashboard"
          onRetry={() => void q.refetch()}
        />
      </div>
    );
  }

  const data = q.data!;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/cursos" className="hover:text-slate-800">
          Cursos
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-800">Dashboard</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hola, {user.full_name?.split(' ')[0] ?? 'alumno'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Continúa donde lo dejaste y mantén tu perfil listo para el mentor.
          </p>
        </div>
        <Link
          to="/mi-negocio"
          className="focus-ring inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Mi negocio
        </Link>
      </header>

      {profileIncomplete ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Completa tu perfil de negocio</p>
          <p className="mt-1 text-amber-900/90">
            Así el mentor IA puede aplicar mejor las lecciones a tu caso.
          </p>
          <Link
            to="/mi-negocio"
            className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950"
          >
            Ir a Mi negocio
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : null}

      <section className="space-y-3">
        {data.courses.length === 0 ? (
          <EmptyState
            title="Sin cursos publicados"
            description="Cuando haya cursos publicados en el catálogo aparecerán aquí."
          />
        ) : (
          <StudentCourseCatalog courses={data.courses} />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-note-600" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900">
            Notas recientes
          </h2>
        </div>
        {data.notes.length === 0 ? (
          <EmptyState
            compact
            title="Sin notas aún"
            description="Abre una lección y crea notas desde el panel derecho o desde el mentor IA."
          />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {data.notes.map((n) => (
              <li key={n.id}>
                <Link
                  to={noteHref(n, data.slugByCourseId)}
                  className="focus-ring block px-4 py-3 transition hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-900">
                    {n.title || 'Sin título'}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {n.content.replace(/\n/g, ' ').trim() || '—'}
                  </p>
                  <p className="mt-1 text-[10px] uppercase text-slate-400">
                    Ver en el curso
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
