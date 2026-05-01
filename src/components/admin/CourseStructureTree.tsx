import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils/cn';
import type { CourseStructure } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import { LessonContentChips } from '@/components/admin/LessonContentChips';

const outlineLinkClass =
  'focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50';

interface Props {
  courseId: string;
}

export function CourseStructureTree({ courseId }: Props) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: queryKeys.admin.course(courseId),
    queryFn: () => adminCoursesRepo.getStructure(courseId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.admin.course(courseId) });
    qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
    const slug = q.data?.course.slug;
    if (slug) {
      qc.invalidateQueries({ queryKey: queryKeys.course.structureBySlug(slug) });
    }
  };

  const addModule = useMutation({
    mutationFn: () => adminCoursesRepo.addModule(courseId, 'Nuevo capítulo'),
    onSuccess: invalidate,
  });

  const addSection = useMutation({
    mutationFn: (moduleId: string) =>
      adminCoursesRepo.addSection(courseId, moduleId, 'Nueva sección'),
    onSuccess: invalidate,
  });

  const addLessonLinear = useMutation({
    mutationFn: () => adminCoursesRepo.addLesson(courseId, {}),
    onSuccess: invalidate,
  });

  const addLessonMod = useMutation({
    mutationFn: (args: { moduleId?: string; sectionId?: string }) =>
      adminCoursesRepo.addLesson(courseId, args),
    onSuccess: invalidate,
  });

  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) =>
      adminCoursesRepo.deleteLesson(courseId, lessonId),
    onSuccess: invalidate,
  });

  const deleteModule = useMutation({
    mutationFn: (moduleId: string) =>
      adminCoursesRepo.deleteModule(courseId, moduleId),
    onSuccess: invalidate,
  });

  const deleteSection = useMutation({
    mutationFn: (sectionId: string) =>
      adminCoursesRepo.deleteSection(courseId, sectionId),
    onSuccess: invalidate,
  });

  const moveLesson = useMutation({
    mutationFn: ({
      orderedIds,
    }: {
      orderedIds: string[];
    }) => adminCoursesRepo.reorderLessons(courseId, orderedIds),
    onSuccess: invalidate,
  });

  if (q.isLoading) {
    return <LoadingSkeleton variant="sidebar" rows={6} />;
  }
  if (q.isError || !q.data) {
    return (
      <ErrorState
        title="No pudimos cargar el constructor"
        onRetry={() => q.refetch()}
      />
    );
  }

  const structure = q.data;
  const isLinear = structure.course.structure_type === 'linear';
  const sortedLessons = [...structure.lessons].sort(
    (a, b) => a.order_index - b.order_index,
  );

  function lessonSwap(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= sortedLessons.length) return;
    const ids = sortedLessons.map((l) => l.id);
    const t = ids[idx];
    ids[idx] = ids[next]!;
    ids[next] = t!;
    moveLesson.mutate({ orderedIds: ids });
  }

  return (
    <div className="surface-panel space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Course Builder</h2>
          <p className="text-sm text-slate-500">
            {isLinear
              ? 'Estructura lineal: lista ordenada de lecciones.'
              : 'Modular: capítulos, secciones opcionales y lecciones.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isLinear ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              loading={addModule.isPending}
              onClick={() => addModule.mutate()}
            >
              Capítulo
            </Button>
          ) : null}
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            loading={addLessonLinear.isPending}
            onClick={() =>
              isLinear
                ? addLessonLinear.mutate()
                : addLessonMod.mutate({})
            }
          >
            Lección
          </Button>
        </div>
      </div>

      {isLinear ? (
        sortedLessons.length === 0 ? (
          <EmptyState
            title="Sin lecciones"
            description="Añade la primera lección para este curso lineal."
          />
        ) : (
          <ul className="space-y-2">
            {sortedLessons.map((lesson, idx) => (
              <li
                key={lesson.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {lesson.order_index}. {lesson.title}
                  </p>
                  <LessonContentChips lesson={lesson} className="mt-1" />
                  <p className="mt-1 text-xs text-slate-500">
                    {lesson.status}
                    {lesson.is_preview ? ' · Preview' : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Subir"
                    disabled={moveLesson.isPending || idx === 0}
                    onClick={() => lessonSwap(idx, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Bajar"
                    disabled={
                      moveLesson.isPending || idx === sortedLessons.length - 1
                    }
                    onClick={() => lessonSwap(idx, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Link
                    to={`/admin/cursos/${courseId}/lecciones/${lesson.id}`}
                    className={outlineLinkClass}
                  >
                    Editar
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    aria-label="Eliminar lección"
                    loading={deleteLesson.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          '¿Eliminar esta lección? Esta acción no se puede deshacer en el mock.',
                        )
                      ) {
                        deleteLesson.mutate(lesson.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ModularTree
          structure={structure}
          courseId={courseId}
          onAddSection={(moduleId) => addSection.mutate(moduleId)}
          onAddLesson={(args) => addLessonMod.mutate(args)}
          onDeleteModule={(id) => {
            if (
              confirm(
                'Eliminar capítulo y todo su contenido asociado en este mock.',
              )
            ) {
              deleteModule.mutate(id);
            }
          }}
          onDeleteSection={(id) => {
            if (confirm('Eliminar sección y sus lecciones.')) {
              deleteSection.mutate(id);
            }
          }}
          onDeleteLesson={(id) => {
            if (confirm('¿Eliminar lección?')) {
              deleteLesson.mutate(id);
            }
          }}
          pendingSection={addSection.isPending}
          pendingLesson={addLessonMod.isPending}
        />
      )}
    </div>
  );
}

function ModularTree({
  structure,
  courseId,
  onAddSection,
  onAddLesson,
  onDeleteModule,
  onDeleteSection,
  onDeleteLesson,
  pendingSection,
  pendingLesson,
}: {
  structure: CourseStructure;
  courseId: string;
  onAddSection: (moduleId: string) => void;
  onAddLesson: (args: { moduleId?: string; sectionId?: string }) => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  pendingSection: boolean;
  pendingLesson: boolean;
}) {
  const sortedModules = [...structure.modules].sort(
    (a, b) => a.order_index - b.order_index,
  );

  if (sortedModules.length === 0) {
    return (
      <EmptyState
        title="Sin capítulos"
        description="Crea un capítulo o cambia el curso a estructura lineal en la pestaña de datos generales."
      />
    );
  }

  return (
    <ol className="space-y-4">
      {sortedModules.map((mod) => {
        const sections = structure.sections
          .filter((s) => s.module_id === mod.id)
          .sort((a, b) => a.order_index - b.order_index);
        const moduleLessons = structure.lessons
          .filter((l) => l.module_id === mod.id)
          .sort((a, b) => a.order_index - b.order_index);

        return (
          <li
            key={mod.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Layers className="mt-0.5 h-4 w-4 text-slate-400" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {mod.title}
                  </p>
                  {mod.description ? (
                    <p className="text-xs text-slate-500">{mod.description}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  loading={pendingSection}
                  onClick={() => onAddSection(mod.id)}
                >
                  Sección
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  loading={pendingLesson}
                  onClick={() => onAddLesson({ moduleId: mod.id })}
                >
                  Lección (sin sección)
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => onDeleteModule(mod.id)}
                >
                  Eliminar capítulo
                </Button>
              </div>
            </div>

            {sections.length > 0 ? (
              <ul className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
                {sections.map((sec) => {
                  const secLessons = moduleLessons.filter(
                    (l) => l.section_id === sec.id,
                  );
                  return (
                    <li key={sec.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {sec.title}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            loading={pendingLesson}
                            onClick={() =>
                              onAddLesson({
                                moduleId: mod.id,
                                sectionId: sec.id,
                              })
                            }
                          >
                            Lección
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600"
                            onClick={() => onDeleteSection(sec.id)}
                          >
                            Eliminar sección
                          </Button>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-2">
                        {secLessons.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            courseId={courseId}
                            lesson={lesson}
                            onDelete={() => onDeleteLesson(lesson.id)}
                          />
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="mt-3 space-y-2">
                {moduleLessons.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    courseId={courseId}
                    lesson={lesson}
                    onDelete={() => onDeleteLesson(lesson.id)}
                  />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function LessonRow({
  courseId,
  lesson,
  onDelete,
}: {
  courseId: string;
  lesson: Lesson;
  onDelete: () => void;
}) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2',
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {lesson.title}
        </p>
        <LessonContentChips lesson={lesson} className="mt-1" />
        <p className="mt-1 text-xs text-slate-500">{lesson.status}</p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/admin/cursos/${courseId}/lecciones/${lesson.id}`}
          className={outlineLinkClass}
        >
          Editar
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-600"
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </div>
    </li>
  );
}
