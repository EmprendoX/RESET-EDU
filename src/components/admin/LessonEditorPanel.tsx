import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonFormSchema } from '@/lib/admin/lessonFormSchema';
import type { LessonFormValues } from '@/types/admin';

const EMPTY_LESSON_FORM: LessonFormValues = {
  title: '',
  description: '',
  content_text: '',
  ai_context: '',
  video_url: '',
  pdf_url: '',
  file_url: '',
  file_type: 'text',
  duration_minutes: 0,
  order_index: 0,
  is_preview: false,
  status: 'draft',
};
import { lessonToFormValues } from '@/lib/admin/mapLessonToForm';
import { Button } from '@/components/ui/Button';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { LessonAulaPreviewPanel } from '@/components/admin/LessonAulaPreviewPanel';
import { LessonAssetUploaderMock } from '@/components/admin/LessonAssetUploaderMock';

interface Props {
  courseId: string;
  lessonId: string;
}

export function LessonEditorPanel({ courseId, lessonId }: Props) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: queryKeys.admin.course(courseId),
    queryFn: () => adminCoursesRepo.getStructure(courseId),
  });

  const lesson = q.data?.lessons.find((l) => l.id === lessonId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<LessonFormValues>({ defaultValues: EMPTY_LESSON_FORM });

  useEffect(() => {
    if (!q.data) return;
    const l = q.data.lessons.find((x) => x.id === lessonId);
    if (l) reset(lessonToFormValues(l));
  }, [q.data, lessonId, reset]);

  const assignMutation = useMutation({
    mutationFn: (placement: { moduleId?: string; sectionId?: string }) =>
      adminCoursesRepo.assignLessonPlacement(courseId, lessonId, placement),
    onSuccess: (structure) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.course(courseId) });
      const slug = structure?.course.slug ?? q.data?.course.slug;
      if (slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.course.structureBySlug(slug),
        });
      }
      const l = structure?.lessons.find((x) => x.id === lessonId);
      if (l) reset(lessonToFormValues(l));
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: LessonFormValues) =>
      adminCoursesRepo.updateLesson(courseId, lessonId, values),
    onSuccess: (structure) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.course(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
      const slug = structure?.course.slug ?? q.data?.course.slug;
      if (slug) {
        qc.invalidateQueries({
          queryKey: queryKeys.course.structureBySlug(slug),
        });
        qc.invalidateQueries({
          queryKey: queryKeys.course.lesson(slug, lessonId),
        });
      }
      const l = structure?.lessons.find((x) => x.id === lessonId);
      if (l) reset(lessonToFormValues(l));
    },
  });

  async function onSubmit(values: LessonFormValues) {
    const parsed = lessonFormSchema.safeParse(values);
    if (!parsed.success) return;
    await saveMutation.mutateAsync(parsed.data);
  }

  if (q.isLoading) {
    return <LoadingSkeleton variant="sidebar" rows={8} />;
  }
  if (q.isError || !q.data || !lesson) {
    return (
      <ErrorState
        title="Lección no encontrada"
        description="Vuelve al constructor e intenta de nuevo."
      />
    );
  }

  const structure = q.data;
  const isModular = structure.course.structure_type === 'modular';
  const modules = [...structure.modules].sort(
    (a, b) => a.order_index - b.order_index,
  );
  const sectionsInModule = structure.sections.filter(
    (s) => s.module_id === lesson.module_id,
  );

  const previewValues = watch();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="surface-panel min-w-0 space-y-6 p-6"
      >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Título
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('title')}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Descripción corta
          </label>
          <textarea
            rows={2}
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('description')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Tipo de contenido
          </label>
          <select
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('file_type')}
          >
            <option value="text">Texto</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="pptx">Presentación</option>
            <option value="mixed">Mixto</option>
            <option value="unsupported">Otro / descarga</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Duración (min)
          </label>
          <input
            type="number"
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('duration_minutes')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Orden (order_index)
          </label>
          <input
            type="number"
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('order_index')}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('is_preview')} />
            Lección preview
          </label>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="text-xs font-medium text-slate-600">Estado</span>
            <select
              className="focus-ring rounded-lg border border-slate-200 px-2 py-1 text-sm"
              {...register('status')}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Texto de la lección
          </label>
          <textarea
            rows={10}
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            {...register('content_text')}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Contexto IA (lección)
          </label>
          <textarea
            rows={4}
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('ai_context')}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Video URL
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            {...register('video_url')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            PDF URL
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            {...register('pdf_url')}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Archivo / PPT URL
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            {...register('file_url')}
          />
        </div>

        <LessonAssetUploaderMock setValue={setValue} />
      </div>

      {isModular ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ubicación en el temario
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-600">Capítulo</label>
              <select
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={lesson.module_id ?? ''}
                disabled={assignMutation.isPending}
                onChange={(e) => {
                  const v = e.target.value || undefined;
                  assignMutation.mutate({
                    moduleId: v,
                    sectionId: undefined,
                  });
                }}
              >
                <option value="">Sin capítulo</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">Sección</label>
              <select
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={lesson.section_id ?? ''}
                disabled={!lesson.module_id || assignMutation.isPending}
                onChange={(e) => {
                  const v = e.target.value || undefined;
                  assignMutation.mutate({
                    moduleId: lesson.module_id,
                    sectionId: v,
                  });
                }}
              >
                <option value="">Sin sección</option>
                {sectionsInModule.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <Button type="submit" loading={isSubmitting || saveMutation.isPending}>
          Guardar lección
        </Button>
      </div>
      {saveMutation.isError ? (
        <p className="text-xs text-rose-600">No se pudo guardar.</p>
      ) : null}
    </form>

      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <LessonAulaPreviewPanel
          courseTitle={structure.course.title}
          values={previewValues}
        />
      </div>
    </div>
  );
}
