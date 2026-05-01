import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CourseStructureTree } from '@/components/admin/CourseStructureTree';
import { AdminPreviewButton } from '@/components/admin/AdminPreviewButton';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function CourseBuilderPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const q = useQuery({
    queryKey: queryKeys.admin.course(courseId ?? ''),
    queryFn: () => adminCoursesRepo.getStructure(courseId!),
    enabled: Boolean(courseId),
  });

  if (!courseId) {
    return <ErrorState title="Curso no especificado" />;
  }

  if (q.isLoading) {
    return <LoadingSkeleton variant="sidebar" rows={6} />;
  }

  if (q.isError || !q.data) {
    return (
      <ErrorState
        title="Curso no encontrado"
        onRetry={() => q.refetch()}
      />
    );
  }

  const structure = q.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
          to={`/admin/cursos/${courseId}`}
          className="hover:text-slate-800"
        >
          {structure.course.title}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-800">Constructor</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Constructor
        </h1>
        <AdminPreviewButton courseSlug={structure.course.slug} />
      </div>

      <CourseStructureTree courseId={courseId} />
    </div>
  );
}
