import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ChevronRight,
  NotebookPen,
  Pin,
  PinOff,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotesGlobal } from '@/hooks/useNotesGlobal';
import { coursesRepo } from '@/lib/courses/coursesRepo';
import { FullScreenSpinner, LoadingSkeleton } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { buildLoginUrl } from '@/lib/auth/loginRedirect';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { Note } from '@/types/notes';

/**
 * FR-017 — Página global de notas (`/notas`) y por curso (`/notas/:courseId`).
 * Reusa `useNotesGlobal` y consulta `coursesRepo.listPublishedSummaries`
 * para resolver títulos y slugs.
 */
export function NotesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const { isAuthenticated, authReady } = useAuth();

  const [search, setSearch] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'manual' | 'ai' | 'selection'>(
    'all',
  );

  const coursesQuery = useQuery({
    queryKey: ['public', 'courses', 'summaries'],
    queryFn: () => coursesRepo.listPublishedSummaries(),
  });

  const {
    notes,
    isLoading,
    isError,
    refetch,
    removeNote,
    togglePin,
  } = useNotesGlobal({ courseId });

  const courseLookup = useMemo(() => {
    const map = new Map<string, { title: string; slug: string }>();
    for (const c of coursesQuery.data ?? []) {
      map.set(c.id, { title: c.title, slug: c.slug });
    }
    return map;
  }, [coursesQuery.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (pinnedOnly && !n.is_pinned) return false;
      if (sourceFilter !== 'all' && n.source !== sourceFilter) return false;
      if (!term) return true;
      return (
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term) ||
        n.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [notes, search, pinnedOnly, sourceFilter]);

  if (!authReady) {
    return <FullScreenSpinner label="Cargando sesión…" />;
  }
  if (!isAuthenticated) {
    if (isSupabaseConfigured()) {
      return (
        <Navigate
          to={buildLoginUrl(location.pathname, location.search)}
          replace
        />
      );
    }
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <LoadingSkeleton variant="sidebar" rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ErrorState
          title="No pudimos cargar tus notas"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const courseTitle = courseId ? courseLookup.get(courseId)?.title : undefined;

  function noteHref(n: Note): string {
    const slug = courseLookup.get(n.course_id)?.slug;
    if (!slug) return '/dashboard';
    if (n.lesson_id) return `/aprender/${slug}/${n.lesson_id}`;
    return `/aprender/${slug}`;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/dashboard" className="hover:text-slate-800">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        {courseId ? (
          <>
            <Link to="/notas" className="hover:text-slate-800">
              Notas
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-slate-800">{courseTitle ?? 'Curso'}</span>
          </>
        ) : (
          <span className="text-slate-800">Notas</span>
        )}
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <NotebookPen className="h-6 w-6 text-note-600" aria-hidden />
            {courseId
              ? `Notas — ${courseTitle ?? 'Curso'}`
              : 'Mis notas'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {courseId
              ? 'Notas que has guardado en este curso, manuales o desde el mentor IA.'
              : 'Todas tus notas. Filtra por curso, búscalas o ábrelas para volver a la lección.'}
          </p>
        </div>
        {courseId ? (
          <button
            type="button"
            onClick={() => navigate('/notas')}
            className="focus-ring inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Ver todas
          </button>
        ) : null}
      </header>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en título, contenido o tags…"
            className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm"
          />
        </label>
        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value as typeof sourceFilter)
          }
          className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
        >
          <option value="all">Todas las fuentes</option>
          <option value="manual">Manuales</option>
          <option value="ai">Del mentor IA</option>
          <option value="selection">De selección</option>
        </select>
        <button
          type="button"
          onClick={() => setPinnedOnly((v) => !v)}
          className={cn(
            'focus-ring inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium shadow-sm transition',
            pinnedOnly
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          )}
        >
          {pinnedOnly ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          {pinnedOnly ? 'Solo fijadas' : 'Todas'}
        </button>
      </div>

      {!courseId && (coursesQuery.data?.length ?? 0) > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium uppercase tracking-wide text-slate-500">
            Por curso:
          </span>
          {(coursesQuery.data ?? []).map((c) => (
            <Link
              key={c.id}
              to={`/notas/${c.id}`}
              className="focus-ring rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {c.title}
            </Link>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title={
              notes.length === 0
                ? 'Aún no tienes notas'
                : 'Sin resultados con esos filtros'
            }
            description={
              notes.length === 0
                ? 'Abre una lección para crear notas, o pídele al mentor IA que te explique algo y guarda la respuesta como nota.'
                : 'Prueba a quitar filtros o usar otra búsqueda.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((n) => {
              const courseInfo = courseLookup.get(n.course_id);
              return (
                <li
                  key={n.id}
                  className="surface-panel rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={noteHref(n)}
                          className="font-semibold text-slate-900 hover:text-brand-700"
                        >
                          {n.title || 'Sin título'}
                        </Link>
                        {n.is_pinned ? (
                          <span
                            title="Fijada"
                            className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
                          >
                            <Pin className="mr-1 h-3 w-3" /> Fijada
                          </span>
                        ) : null}
                        {n.source === 'ai' ? (
                          <span
                            title="Del mentor IA"
                            className="inline-flex items-center rounded-full bg-ai-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ai-800"
                          >
                            <Sparkles className="mr-1 h-3 w-3" /> IA
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                        {n.content || '—'}
                      </p>
                      <p className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {courseInfo ? (
                          <Link
                            to={`/notas/${n.course_id}`}
                            className="font-medium text-slate-700 hover:underline"
                          >
                            {courseInfo.title}
                          </Link>
                        ) : null}
                        <span>·</span>
                        <span>
                          {new Date(n.updated_at).toLocaleDateString()}
                        </span>
                        {n.tags.length > 0 ? (
                          <>
                            <span>·</span>
                            <span>{n.tags.map((t) => `#${t}`).join(' ')}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => void togglePin(n.id)}
                        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        title={n.is_pinned ? 'Desfijar' : 'Fijar'}
                      >
                        {n.is_pinned ? (
                          <PinOff className="h-4 w-4" />
                        ) : (
                          <Pin className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Eliminar la nota "${n.title || 'Sin título'}"?`,
                            )
                          ) {
                            void removeNote(n.id);
                          }
                        }}
                        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
