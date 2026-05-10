import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loadCourseCatalogRows } from '@/lib/courses/loadCourseCatalogRows';
import { queryKeys } from '@/hooks/queryKeys';
import { FullScreenSpinner } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import {
  StudentCourseCatalog,
  type CourseCatalogRow,
} from '@/components/student/StudentCourseCatalog';
import { PublicSiteHeader } from '@/components/public/PublicSiteHeader';
import { EmptyState } from '@/components/common/EmptyState';
import type { CourseLevel } from '@/types/course';

type SortKey = 'recommended' | 'newest' | 'title';
type AccessFilter = 'all' | 'free' | 'premium';
type LevelFilter = 'all' | CourseLevel;

/**
 * FR-003 — Catálogo público con filtros: búsqueda, categoría, nivel,
 * gratis/premium y orden. Filtros aplicados en cliente sobre las filas
 * devueltas por `loadCourseCatalogRows`.
 */
export function CourseCatalogPage() {
  const { user, authReady } = useAuth();

  const q = useQuery({
    queryKey: queryKeys.catalog.rowsForUser(user.id, user.role),
    queryFn: () => loadCourseCatalogRows(user.id, user.role),
    enabled: authReady,
  });

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [access, setAccess] = useState<AccessFilter>('all');
  const [sort, setSort] = useState<SortKey>('recommended');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const row of q.data ?? []) {
      if (row.category && row.category.trim()) set.add(row.category.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [q.data]);

  const filtered = useMemo<CourseCatalogRow[]>(() => {
    const base = q.data ?? [];
    const term = search.trim().toLowerCase();
    const out = base.filter((c) => {
      if (term) {
        const hit =
          c.title.toLowerCase().includes(term) ||
          c.short_description.toLowerCase().includes(term) ||
          (c.category ?? '').toLowerCase().includes(term);
        if (!hit) return false;
      }
      if (category !== 'all' && c.category !== category) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (access === 'free' && c.is_free !== true) return false;
      if (access === 'premium' && c.is_free !== false) return false;
      return true;
    });
    if (sort === 'recommended') {
      // Mantenemos el orden de loadCourseCatalogRows (acceso primero, luego título).
      return out;
    }
    const copy = [...out];
    if (sort === 'newest') {
      copy.sort((a, b) => {
        const ad = a.published_at ?? '';
        const bd = b.published_at ?? '';
        return bd.localeCompare(ad);
      });
    } else if (sort === 'title') {
      copy.sort((a, b) => a.title.localeCompare(b.title, 'es'));
    }
    return copy;
  }, [q.data, search, category, level, access, sort]);

  if (!authReady) {
    return (
      <>
        <PublicSiteHeader />
        <FullScreenSpinner label="Cargando…" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <PublicSiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-800">
            Inicio
          </Link>
          <span aria-hidden className="text-slate-400">
            /
          </span>
          <span className="text-slate-800">Cursos</span>
        </nav>

        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Catálogo de cursos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Explora lo publicado. Con acceso podrás continuar en el aula; si un
            curso es de pago, necesitas matrícula activa.
          </p>
        </header>

        <section
          aria-label="Filtros de catálogo"
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_repeat(4,minmax(0,auto))]"
        >
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar curso o categoría…"
              className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm"
            />
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            aria-label="Categoría"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelFilter)}
            className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            aria-label="Nivel"
          >
            <option value="all">Todos los niveles</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
          <select
            value={access}
            onChange={(e) => setAccess(e.target.value as AccessFilter)}
            className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            aria-label="Precio"
          >
            <option value="all">Gratis y premium</option>
            <option value="free">Solo gratis</option>
            <option value="premium">Solo premium</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            aria-label="Ordenar"
          >
            <option value="recommended">Recomendado</option>
            <option value="newest">Más nuevos</option>
            <option value="title">Título A→Z</option>
          </select>
        </section>

        {q.isPending ? (
          <LoadingSkeleton variant="sidebar" rows={4} />
        ) : q.isError ? (
          <ErrorState
            title="No pudimos cargar el catálogo"
            onRetry={() => void q.refetch()}
          />
        ) : !q.data?.length ? (
          <EmptyState
            title="Sin cursos publicados"
            description="Cuando se publiquen cursos aparecerán aquí."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin resultados con esos filtros"
            description="Prueba a quitar algún filtro o usar otra búsqueda."
          />
        ) : (
          <StudentCourseCatalog courses={filtered} />
        )}
      </main>
    </div>
  );
}
