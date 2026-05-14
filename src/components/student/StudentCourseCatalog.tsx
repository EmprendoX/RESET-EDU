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
        'reset-card relative flex flex-col overflow-hidden transition',
        row.hasAccess ? 'hover:border-brand-500/40 hover:shadow-2xl' : 'opacity-95',
      )}
    >
      <div
        className={cn(
          'relative h-32 bg-reset-bg-3 bg-cover bg-center',
          !row.cover_image_url && 'flex items-center justify-center',
        )}
        style={
          row.cover_image_url
            ? { backgroundImage: `url(${row.cover_image_url})` }
            : undefined
        }
      >
        {!row.cover_image_url ? (
          <Sparkles className="h-9 w-9 text-reset-text-dim" aria-hidden />
        ) : null}
        {!row.hasAccess ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65 backdrop-blur-[2px]"
            aria-hidden
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-reset-bg-2 text-white shadow-md ring-1 ring-reset-border-strong">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <span className="rounded-full bg-reset-bg-2/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-reset-text-muted ring-1 ring-reset-border">
              Sin acceso
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display font-semibold leading-snug text-white">
            {row.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-reset-text-muted">
            {row.short_description || 'Sin descripción corta.'}
          </p>
        </div>

        {row.hasAccess ? (
          <div className="mt-auto space-y-2.5">
            <div className="flex justify-between text-xs text-reset-text-muted">
              <span>
                {row.completedLessons}/{row.lessonCount} lecciones
              </span>
              <span className="font-medium tabular-nums text-white">
                {row.progressPercent}%
              </span>
            </div>
            <div className="reset-progress">
              <div
                className="reset-progress__bar bg-gradient-to-r from-brand-600 to-brand-400"
                style={{ width: `${row.progressPercent}%` }}
              />
            </div>
            <Link
              to={href}
              className="focus-ring inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-400 active:bg-brand-600"
            >
              Continuar
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mt-auto space-y-2">
            <p className="mb-1 text-xs leading-relaxed text-reset-text-muted">
              Este curso no está incluido en tu plan. Cuando tengas acceso podrás
              estudiarlo aquí mismo.
            </p>
            <span
              className="focus-ring inline-flex h-9 w-full cursor-not-allowed items-center justify-center rounded-xl border border-reset-border bg-reset-bg-3 px-3 text-xs font-semibold text-reset-text-dim"
              aria-disabled
            >
              Bloqueado
            </span>
            <Link
              to={`/cursos/${row.slug}`}
              className="focus-ring inline-flex h-9 w-full items-center justify-center rounded-xl border border-brand-500/40 bg-transparent px-3 text-xs font-semibold text-brand-300 transition hover:bg-brand-500/10"
            >
              Ver ficha pública
            </Link>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                Tus cursos
              </p>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                Sigue aprendiendo
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-reset-text-muted">
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-reset-text-muted">
              Catálogo
            </p>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Próximos cursos
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-reset-text-muted">
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
