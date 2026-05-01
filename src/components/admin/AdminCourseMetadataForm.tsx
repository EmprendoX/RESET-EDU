import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { courseMetadataSchema } from '@/lib/admin/courseMetadataSchema';
import type { CourseMetadataFormValues } from '@/types/admin';
import { slugify } from '@/lib/admin/slugify';
import { Button } from '@/components/ui/Button';
import { AdminMockFileDropzone } from '@/components/admin/AdminMockFileDropzone';

interface Props {
  defaultValues: CourseMetadataFormValues;
  onSubmit: (values: CourseMetadataFormValues) => Promise<void>;
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="md:col-span-2">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function AdminCourseMetadataForm({
  defaultValues,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseMetadataFormValues>({
    defaultValues,
    values: defaultValues,
  });

  const isFree = watch('is_free');
  const lastCoverBlobRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (lastCoverBlobRef.current) {
        URL.revokeObjectURL(lastCoverBlobRef.current);
        lastCoverBlobRef.current = null;
      }
    },
    [],
  );

  function onCoverFiles(files: File[]) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (lastCoverBlobRef.current) {
      URL.revokeObjectURL(lastCoverBlobRef.current);
    }
    const url = URL.createObjectURL(file);
    lastCoverBlobRef.current = url;
    setValue('cover_image_url', url, { shouldDirty: true, shouldValidate: true });
  }

  async function submit(values: CourseMetadataFormValues) {
    const parsed = courseMetadataSchema.safeParse(values);
    if (!parsed.success) return;
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="surface-panel space-y-8 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <SectionTitle
          title="General"
          description="Identidad del curso y copy público."
        />

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Título
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('title')}
          />
          {errors.title ? (
            <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Slug (URL)
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            {...register('slug')}
          />
          <div className="mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setValue('slug', slugify(watch('title')), {
                  shouldValidate: true,
                });
              }}
            >
              Generar desde título
            </Button>
          </div>
          {errors.slug ? (
            <p className="mt-1 text-xs text-rose-600">{errors.slug.message}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Descripción corta
          </label>
          <textarea
            rows={2}
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('short_description')}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Descripción larga
          </label>
          <textarea
            rows={5}
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('description')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">
            Categoría
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('category')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">
            Nivel
          </label>
          <select
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('level')}
          >
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Portada del curso
          </label>
          <AdminMockFileDropzone
            accept="image/jpeg,image/png,image/webp,image/gif,image/*"
            description="Imagen local (URL blob en el navegador). Tras guardar, si recargas la página la misma URL puede dejar de funcionar hasta tener Storage."
            onFilesSelected={onCoverFiles}
          />
          <label className="mt-3 block text-xs font-medium text-slate-600">
            O pegar URL externa
          </label>
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('cover_image_url')}
          />
        </div>

        <SectionTitle
          title="Comercial y acceso"
          description="Estado de publicación y modalidad (mock · sin pasarela)."
        />

        <div>
          <label className="block text-xs font-medium text-slate-600">
            Estructura del curso
          </label>
          <select
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('structure_type')}
          >
            <option value="linear">Lineal</option>
            <option value="modular">Modular (capítulos / secciones)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600">
            Estado
          </label>
          <select
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('status')}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-medium text-slate-600">Modalidad</p>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                className="text-brand-600 focus-ring"
                checked={isFree}
                onChange={() => {
                  setValue('is_free', true, { shouldDirty: true });
                  setValue('price', '', { shouldDirty: true });
                }}
              />
              Gratis
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                className="text-brand-600 focus-ring"
                checked={!isFree}
                onChange={() =>
                  setValue('is_free', false, { shouldDirty: true })
                }
              />
              Premium (precio)
            </label>
          </div>
        </div>

        <div className="flex items-center md:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('is_featured')} />
            Curso destacado en catálogo (cuando exista)
          </label>
        </div>

        <div className={isFree ? 'opacity-50 md:col-span-2' : 'md:col-span-2'}>
          <label className="block text-xs font-medium text-slate-600">
            Precio (Premium)
          </label>
          <input
            type="text"
            inputMode="decimal"
            disabled={isFree}
            className="focus-ring mt-1 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed"
            {...register('price')}
          />
        </div>

        <SectionTitle
          title="Mentor IA"
          description="Contexto que recibirá el mentor para orientar respuestas a nivel curso."
        />

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600">
            Contexto IA del curso
          </label>
          <textarea
            rows={4}
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            {...register('ai_context')}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <Button type="submit" loading={isSubmitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
