import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Construction } from 'lucide-react';
import { AdminCourseMetadataForm } from '@/components/admin/AdminCourseMetadataForm';
import { AdminPreviewButton } from '@/components/admin/AdminPreviewButton';
import { PublishBar } from '@/components/admin/PublishBar';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { courseToMetadataFormValues } from '@/lib/admin/mapCourseToMetadataForm';
import type { CourseMetadataFormValues } from '@/types/admin';
import { queryKeys } from '@/hooks/queryKeys';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/Button';
export function AdminCourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: queryKeys.admin.course(courseId ?? ''),
    queryFn: () => adminCoursesRepo.getStructure(courseId!),
    enabled: Boolean(courseId),
  });

  const saveMutation = useMutation({
    mutationFn: (values: CourseMetadataFormValues) =>
      adminCoursesRepo.updateCourseMetadata(courseId!, values),
    onSuccess: (structure) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.course(courseId!) });
      if (structure?.course.slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.course.structureBySlug(structure.course.slug),
        });
      }
    },
  });

  if (!courseId) {
    return <ErrorState title="Curso no especificado" />;
  }

  if (q.isLoading) {
    return <LoadingSkeleton variant="sidebar" rows={8} />;
  }

  if (q.isError || !q.data) {
    return (
      <ErrorState
        title="Curso no encontrado"
        description="El ID no existe en el catálogo."
        onRetry={() => q.refetch()}
      />
    );
  }

  const structure = q.data;

  async function onSave(values: CourseMetadataFormValues) {
    try {
      await saveMutation.mutateAsync(values);
    } catch (e) {
      if (e instanceof Error && e.message === 'DUPLICATE_SLUG') {
        alert('Ya existe otro curso con ese slug.');
        return;
      }
      throw e;
    }
  }

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
        <span className="text-slate-800">{structure.course.title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Datos del curso
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Metadatos, estructura y contexto IA a nivel curso.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminPreviewButton courseSlug={structure.course.slug} />
          <Button
            variant="secondary"
            leftIcon={<Construction className="h-4 w-4" />}
            onClick={() => navigate(`/admin/cursos/${courseId}/builder`)}
          >
            Abrir constructor
          </Button>
        </div>
      </div>

      <PublishBar courseId={courseId} structure={structure} />

      <AdminCourseMetadataForm
        defaultValues={courseToMetadataFormValues(structure.course)}
        onSubmit={onSave}
      />

      {saveMutation.isError && !(saveMutation.error instanceof Error && saveMutation.error.message === 'DUPLICATE_SLUG') ? (
        <p className="text-sm text-rose-600">Error al guardar.</p>
      ) : null}
    </div>
  );
}
