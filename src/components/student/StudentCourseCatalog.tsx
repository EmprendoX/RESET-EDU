import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import type { PublishedCatalogRow } from '@/types/course';
import { cn } from '@/lib/utils/cn';

export type CourseCatalogRow = PublishedCatalogRow & {
  progressPercent: number;
  completedLessons: number;
  continueLessonId: string | null;
};

function CourseCatalogCard({ row }: { row: CourseCatalogRow }) {
  const href =
    row.continueLessonId != null
      ? `/aprender/${row.slug}/${row.continueLessonId}`
      : `/aprender/${row.slug}`;

  return (
    <li
      className={cn(
        'surface-panel relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition',
        row.hasAccess
          ? 'border-slate-200/90 hover:border-brand-200 hover:shadow-md'
          : 'border-slate-200/80',
      )}
    >
      <div
        className={cn(
          'relative h-32 bg-slate-100 bg-cover bg-center',
          !row.cover_image_url && 'flex items-center justify-center',
        )}
        style={
          row.cover_image_url
            ? { backgroundImage: `url(${row.cover_image_url})` }
            : undefined
        }
      >
        {!row.cover_image_url ? (
          <Sparkles className="h-9 w-9 text-slate-300" aria-hidden />
        ) : null}
        {!row.hasAccess ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/55 backdrop-blur-[2px]"
            aria-hidden
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md ring-1 ring-slate-200/80">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200/80">
              Sin acceso
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold leading-snug text-slate-900">
            {row.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {row.short_description || 'Sin descripción corta.'}
          </p>
        </div>

        {row.hasAccess ? (
          <div className="mt-auto space-y-2.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {row.completedLessons}/{row.lessonCount} lecciones
              </span>
              <span className="font-medium tabular-nums text-slate-700">
                {row.progressPercent}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-[width]"
                style={{ width: `${row.progressPercent}%` }}
              />
            </div>
            <Link
              to={href}
              className="focus-ring inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 active:bg-brand-800"
            >
              Continuar
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mt-auto">
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
              Este curso no está incluido en tu plan. Cuando tengas acceso podrás
              estudiarlo aquí mismo.
            </p>
            <span
              className="focus-ring inline-flex h-9 w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500"
              aria-disabled
            >
              Bloqueado
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

export function StudentCourseCatalog({ courses }: { courses: CourseCatalogRow[] }) {
  const yours = courses.filter((c) => c.hasAccess);
  const locked = courses.filter((c) => !c.hasAccess);

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {yours.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">
                Tus cursos
              </p>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Sigue aprendiendo
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Entra al aula, marca progreso y usa el mentor IA con el contenido
                de cada lección.
              </p>
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {yours.map((row) => (
              <CourseCatalogCard key={row.id} row={row} />
            ))}
          </ul>
        </section>
      ) : null}

      {locked.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Catálogo
            </p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Próximos cursos
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Así se verá tu escuela cuando amplies el acceso: mismas tarjetas,
              contenido bloqueado hasta activar el curso.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((row) => (
              <CourseCatalogCard key={row.id} row={row} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
