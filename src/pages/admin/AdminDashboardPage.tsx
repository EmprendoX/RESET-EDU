import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileImage, Layers, Plus } from 'lucide-react';
import type { AdminCourseListFilters } from '@/types/admin';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { listMockMedia } from '@/data/adminMediaMockStore';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';

const DASH_LIST_FILTERS: AdminCourseListFilters = {
  search: '',
  status: 'all',
  sort: 'updated_desc',
};

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: [...queryKeys.admin.courses(), DASH_LIST_FILTERS],
    queryFn: () => adminCoursesRepo.listCourses(DASH_LIST_FILTERS),
  });

  const mediaQ = useQuery({
    queryKey: ['admin', 'media-count'],
    queryFn: async () => listMockMedia().length,
    staleTime: 5_000,
  });

  if (q.isLoading) {
    return <LoadingSkeleton variant="sidebar" rows={6} />;
  }

  const rows = q.data ?? [];
  const drafts = rows.filter((r) => r.status === 'draft').length;
  const published = rows.filter((r) => r.status === 'published').length;
  const totalLessons = rows.reduce((n, r) => n + r.lessonCount, 0);
  const mediaCount = mediaQ.data ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm text-slate-600">
          Gestiona cursos, lecciones y contenido (demo mock · sin Supabase).
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin cursos en el catálogo"
          description="Crea un curso o restablece los datos seed desde las herramientas de desarrollo."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total cursos
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {rows.length}
            </p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Publicados
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {published}
            </p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Borradores
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{drafts}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Lecciones
            </p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Layers className="h-5 w-5 text-slate-400" aria-hidden />
              {totalLessons}
            </p>
          </div>
          <div className="surface-card p-4 sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Archivos (biblioteca)
            </p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
              <FileImage className="h-5 w-5 text-slate-400" aria-hidden />
              {mediaQ.isLoading ? '…' : mediaCount}
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Accesos rápidos
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/cursos/nuevo')}
          >
            Crear curso
          </Button>
          <Button
            variant="outline"
            leftIcon={<BookOpen className="h-4 w-4" />}
            onClick={() => navigate('/admin/cursos')}
          >
            Ver cursos
          </Button>
          <Button
            variant="outline"
            leftIcon={<FileImage className="h-4 w-4" />}
            onClick={() => navigate('/admin/media')}
          >
            Biblioteca de archivos
          </Button>
        </div>
      </div>
    </div>
  );
}
