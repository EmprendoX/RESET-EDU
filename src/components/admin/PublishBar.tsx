import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseStructure } from '@/types/course';
import { Button } from '@/components/ui/Button';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { validateCoursePublish } from '@/lib/admin/publishValidation';
import { queryKeys } from '@/hooks/queryKeys';

interface Props {
  courseId: string;
  structure: CourseStructure | null | undefined;
}

export function PublishBar({ courseId, structure }: Props) {
  const qc = useQueryClient();
  const previewIssues = structure ? validateCoursePublish(structure) : [];
  const errors = previewIssues.filter((i) => i.severity === 'error');

  const publishMutation = useMutation({
    mutationFn: () => adminCoursesRepo.publishCourse(courseId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.course(courseId) });
      if (res.structure?.course.slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.course.structureBySlug(res.structure.course.slug),
        });
      }
    },
  });

  const draftMutation = useMutation({
    mutationFn: () => adminCoursesRepo.setCourseStatus(courseId, 'draft'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.course(courseId) });
      if (structure?.course.slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.course.structureBySlug(structure.course.slug),
        });
      }
    },
  });

  return (
    <div className="surface-panel space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          loading={publishMutation.isPending}
          disabled={!structure || errors.length > 0}
          onClick={() => publishMutation.mutate()}
        >
          Publicar curso
        </Button>
        <Button
          size="sm"
          variant="outline"
          loading={draftMutation.isPending}
          disabled={structure?.course.status === 'draft'}
          onClick={() => draftMutation.mutate()}
        >
          Marcar borrador
        </Button>
      </div>
      {previewIssues.length > 0 ? (
        <ul className="space-y-1 text-xs">
          {previewIssues.map((issue) => (
            <li
              key={`${issue.code}-${issue.message}`}
              className={
                issue.severity === 'error'
                  ? 'text-rose-600'
                  : 'text-amber-700'
              }
            >
              {issue.severity === 'error' ? 'Error: ' : 'Aviso: '}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">
          Listo para publicar desde el punto de vista del mock (sin backend).
        </p>
      )}
      {publishMutation.isError ? (
        <p className="text-xs text-rose-600">No se pudo publicar.</p>
      ) : null}
      {publishMutation.data && !publishMutation.data.ok ? (
        <p className="text-xs text-rose-600">
          Corrige los errores antes de publicar.
        </p>
      ) : null}
    </div>
  );
}
