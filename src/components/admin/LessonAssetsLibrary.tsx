import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock, Search, Unlock } from 'lucide-react';
import {
  getLessonAssetSignedUrl,
  listLessonAssetsAdmin,
  type AdminAssetRow,
} from '@/lib/storage/lessonAssetsRepo';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminFileTypeBadge } from '@/components/admin/AdminFileTypeBadge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

/**
 * Biblioteca real de archivos de lección (`lesson_assets`).
 * Lectura: el RLS de `lesson_assets_select_access` (006) permite a staff
 * ver todos. Para abrir un archivo se firma una URL temporal.
 */
export function LessonAssetsLibrary() {
  const supabaseOk = isSupabaseConfigured() && Boolean(getSupabase());

  const q = useQuery({
    queryKey: ['admin', 'lesson-assets'],
    queryFn: () => listLessonAssetsAdmin(getSupabase()!),
    enabled: supabaseOk,
  });

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [openingId, setOpeningId] = useState<string | null>(null);

  const courseChoices = useMemo(() => {
    const map = new Map<string, string>();
    (q.data ?? []).forEach((r) => {
      if (!map.has(r.course_id)) map.set(r.course_id, r.course_title);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  }, [q.data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (q.data ?? []).filter((r) => {
      if (courseFilter !== 'all' && r.course_id !== courseFilter) return false;
      if (!term) return true;
      return (
        r.file_name.toLowerCase().includes(term) ||
        r.course_title.toLowerCase().includes(term) ||
        r.lesson_title.toLowerCase().includes(term)
      );
    });
  }, [q.data, search, courseFilter]);

  if (!supabaseOk) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-slate-600">
          Configura <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code>{' '}
          y{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>{' '}
          para ver la biblioteca de archivos.
        </p>
      </div>
    );
  }

  if (q.isPending) {
    return <LoadingSkeleton variant="sidebar" rows={6} />;
  }

  if (q.isError) {
    return (
      <ErrorState
        title="No se pudieron cargar los archivos"
        onRetry={() => void q.refetch()}
      />
    );
  }

  async function handleOpen(row: AdminAssetRow) {
    const sb = getSupabase();
    if (!sb || !row.storage_path) return;
    setOpeningId(row.id);
    try {
      const url = await getLessonAssetSignedUrl(sb, row.storage_path, 600);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      window.alert(
        err instanceof Error
          ? `No se pudo abrir el archivo: ${err.message}`
          : 'No se pudo abrir el archivo.',
      );
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por archivo, curso o lección…"
            className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm"
          />
        </label>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="focus-ring h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
          aria-label="Filtrar por curso"
        >
          <option value="all">Todos los cursos</option>
          {courseChoices.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            (q.data?.length ?? 0) === 0
              ? 'Sin archivos en la biblioteca'
              : 'Sin resultados con esos filtros'
          }
          description={
            (q.data?.length ?? 0) === 0
              ? 'Sube archivos desde el editor de cada lección. Aparecerán aquí.'
              : 'Prueba a quitar filtros o cambiar la búsqueda.'
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 p-3 text-sm"
            >
              <AdminFileTypeBadge type={row.file_type} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">
                  {row.file_name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  <Link
                    to={`/admin/cursos/${row.course_id}/builder`}
                    className="hover:text-slate-800"
                  >
                    {row.course_title}
                  </Link>
                  {' · '}
                  <Link
                    to={`/admin/cursos/${row.course_id}/lecciones/${row.lesson_id}`}
                    className="hover:text-slate-800"
                  >
                    {row.lesson_title}
                  </Link>
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                  row.visibility === 'public'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700',
                )}
                title={
                  row.visibility === 'public'
                    ? 'Asset público (URL directa)'
                    : 'Asset privado (URL firmada temporal)'
                }
              >
                {row.visibility === 'public' ? (
                  <Unlock className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {row.visibility}
              </span>
              <span className="hidden whitespace-nowrap text-xs text-slate-500 md:inline">
                {new Date(row.created_at).toLocaleDateString('es')}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={!row.storage_path || openingId === row.id}
                onClick={() => void handleOpen(row)}
                rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
              >
                {openingId === row.id ? 'Abriendo…' : 'Abrir'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
