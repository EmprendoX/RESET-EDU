import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { LessonEditorPanel } from '@/components/admin/LessonEditorPanel';
import { AdminPreviewButton } from '@/components/admin/AdminPreviewButton';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function LessonEditorPage() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  const q = useQuery({
    queryKey: queryKeys.admin.course(courseId ?? ''),
    queryFn: () => adminCoursesRepo.getStructure(courseId!),
    enabled: Boolean(courseId),
  });

  if (!courseId || !lessonId) {
    return <ErrorState title="Ruta incompleta" />;
  }

  if (q.isLoading) {
    return <LoadingSkeleton variant="sidebar" rows={4} />;
  }

  if (q.isError || !q.data) {
    return (
      <ErrorState title="Curso no encontrado" onRetry={() => q.refetch()} />
    );
  }

  const structure = q.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/admin" className="hover:text-slate-800">
          Admin
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/admin/cursos" className="hover:text-slate-800">
          Cursos
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link
          to={`/admin/cursos/${courseId}/builder`}
          className="hover:text-slate-800"
        >
          {structure.course.title}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-800">Editar lección</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Editor de lección
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Contenido, multimedia y contexto IA por lección.
          </p>
        </div>
        <AdminPreviewButton courseSlug={structure.course.slug} />
      </div>

      <LessonEditorPanel courseId={courseId} lessonId={lessonId} />
    </div>
  );
}
