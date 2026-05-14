import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { coursesRepo } from '@/lib/courses/coursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { buildLoginUrl } from '@/lib/auth/loginRedirect';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated, authReady } = useAuth();

  const structureQuery = useQuery({
    queryKey: queryKeys.course.structureBySlug(slug ?? ''),
    queryFn: () => coursesRepo.getCourseStructureBySlug(slug!),
    enabled: Boolean(slug) && authReady,
  });

  const accessQuery = useQuery({
    queryKey: [...queryKeys.catalog.rowsForUser(user.id, user.role), slug],
    queryFn: async () => {
      const rows = await coursesRepo.listPublishedCatalogForUser({
        userId: user.id,
        role: user.role,
      });
      return rows.find((r) => r.slug === slug) ?? null;
    },
    enabled: authReady && Boolean(slug),
  });

  if (!slug) {
    return (
      <>
        <PublicSiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <ErrorState title="Curso no especificado" />
        </div>
      </>
    );
  }

  if (!authReady) {
    return (
      <>
        <PublicSiteHeader />
        <FullScreenSpinner tone="dark" label="Cargando…" />
      </>
    );
  }

  if (structureQuery.isPending || accessQuery.isPending) {
    return (
      <>
        <PublicSiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <LoadingSkeleton variant="sidebar" rows={6} />
        </div>
      </>
    );
  }

  if (structureQuery.isError || !structureQuery.data) {
    return (
      <>
        <PublicSiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <ErrorState
            title="Curso no encontrado"
            description="No existe o no está publicado."
          />
        </div>
      </>
    );
  }

  const structure = structureQuery.data;
  const row = accessQuery.data;
  const hasAccess = row?.hasAccess ?? false;
  const isFree = structure.course.is_free;

  const sortedLessons = [...structure.lessons].sort(
    (a, b) => a.order_index - b.order_index,
  );

  const loginHref = buildLoginUrl(
    `/cursos/${slug}`,
    typeof window !== 'undefined' ? window.location.search : '',
  );

  return (
    <div className="reset-dark min-h-screen bg-reset-bg-0 font-body text-white">
      <PublicSiteHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-reset-text-muted">
          <Link to="/" className="transition hover:text-white">
            Inicio
          </Link>
          <span className="text-reset-text-dim">/</span>
          <Link to="/cursos" className="transition hover:text-white">
            Cursos
          </Link>
          <span className="text-reset-text-dim">/</span>
          <span className="truncate text-white">{structure.course.title}</span>
        </nav>

        <header className="reset-card overflow-hidden">
          <div
            className="h-40 bg-reset-bg-3 bg-cover bg-center"
            style={
              structure.course.cover_image_url
                ? {
                    backgroundImage: `url(${structure.course.cover_image_url})`,
                  }
                : undefined
            }
          />
          <div className="space-y-3 p-6">
            <div className="flex flex-wrap gap-2">
              <span className="reset-chip">{structure.course.category}</span>
              <span className="reset-chip">{structure.course.level}</span>
              {isFree ? (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                  Gratis
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/30">
                  {structure.course.price != null
                    ? `${structure.course.price} (referencia)`
                    : 'Premium'}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              {structure.course.title}
            </h1>
            <p className="text-sm leading-relaxed text-reset-text-muted">
              {structure.course.short_description || structure.course.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {!hasAccess ? (
                <div className="flex w-full flex-col gap-3 rounded-xl border border-reset-border bg-reset-bg-3 px-4 py-3 text-sm text-reset-text-muted sm:flex-row sm:items-center">
                  <div className="flex gap-2">
                    <Lock className="h-5 w-5 shrink-0 text-reset-text-dim" aria-hidden />
                    <span>
                      Este curso requiere matrícula activa. Si ya pagaste, inicia
                      sesión con la misma cuenta o contacta al equipo.
                    </span>
                  </div>
                  {!isAuthenticated && isSupabaseConfigured() ? (
                    <Link to={loginHref} className="shrink-0">
                      <Button type="button" variant="secondary" size="sm">
                        Iniciar sesión
                      </Button>
                    </Link>
                  ) : null}
                </div>
              ) : !isAuthenticated && isSupabaseConfigured() ? (
                <Link to={loginHref}>
                  <Button type="button" variant="primary" size="md">
                    Inicia sesión para entrar al aula
                  </Button>
                </Link>
              ) : !isAuthenticated && !isSupabaseConfigured() ? (
                <Link to={`/aprender/${slug}`}>
                  <Button type="button" variant="primary" size="md">
                    Ver curso (demo)
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </Link>
              ) : (
                <Link to={`/aprender/${slug}`}>
                  <Button type="button" variant="primary" size="md">
                    Ir al aula
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="reset-card p-6">
          <h2 className="font-display text-lg font-semibold text-white">Temario</h2>
          <p className="mt-1 text-xs text-reset-text-muted">
            Las lecciones marcadas como vista previa pueden ser visibles sin
            matrícula según políticas del curso.
          </p>
          <ol className="mt-4 space-y-2">
            {sortedLessons.length === 0 ? (
              <li className="text-sm text-reset-text-muted">Sin lecciones aún.</li>
            ) : (
              sortedLessons.map((lesson, idx) => (
                <li
                  key={lesson.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-reset-border bg-reset-bg-1 px-3 py-2 text-sm"
                >
                  <span className="text-white/90">
                    <span className="mr-2 tabular-nums text-reset-text-dim">
                      {idx + 1}.
                    </span>
                    {lesson.title}
                  </span>
                  {lesson.is_preview ? (
                    <span className="shrink-0 rounded bg-reset-bg-3 px-2 py-0.5 text-[10px] font-semibold uppercase text-reset-text-muted ring-1 ring-reset-border">
                      Preview
                    </span>
                  ) : null}
                </li>
              ))
            )}
          </ol>
        </section>
      </main>
    </div>
  );
}
