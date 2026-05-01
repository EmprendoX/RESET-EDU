import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Plus, Search } from 'lucide-react';
import type { AdminCourseListFilters } from '@/types/admin';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { queryKeys } from '@/hooks/queryKeys';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { CourseStatusBadge } from '@/components/admin/CourseStatusBadge';

export function AdminCourseListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] =
    useState<AdminCourseListFilters['status']>('all');
  const [sort, setSort] =
    useState<AdminCourseListFilters['sort']>('updated_desc');

  const filters = useMemo(
    (): AdminCourseListFilters => ({ search, status, sort }),
    [search, status, sort],
  );

  const q = useQuery({
    queryKey: [...queryKeys.admin.courses(), filters],
    queryFn: () => adminCoursesRepo.listCourses(filters),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-slate-600">
            Lista, filtros y acceso al constructor (mock).
          </p>
          <p className="mt-1 max-w-xl text-xs text-slate-500">
            Al crear un curso nuevo irás al editor de datos: ahí puedes subir la
            portada; los archivos de lección se gestionan en cada lección del
            constructor.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/admin/cursos/nuevo')}
        >
          Nuevo curso
        </Button>
      </div>

      <div className="surface-panel flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por título o slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as AdminCourseListFilters['status'])
          }
          className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as AdminCourseListFilters['sort'])
          }
          className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="updated_desc">Actualizado · reciente</option>
          <option value="created_desc">Creado · reciente</option>
          <option value="title_asc">Título A–Z</option>
        </select>
      </div>

      {q.isLoading ? (
        <LoadingSkeleton variant="sidebar" rows={6} />
      ) : q.data?.length === 0 ? (
        <EmptyState
          title="No hay cursos"
          description="Crea un curso nuevo o ajusta los filtros."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Estado
                  </th>
                  <th className="hidden whitespace-nowrap px-4 py-3 font-semibold sm:table-cell">
                    Estructura
                  </th>
                  <th className="hidden whitespace-nowrap px-4 py-3 font-semibold md:table-cell">
                    Lecciones
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Actualizado
                  </th>
                  <th className="min-w-[10rem] px-4 py-3 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {q.data?.map((row) => (
                  <tr key={row.id} className="transition hover:bg-slate-50/90">
                    <td className="max-w-[220px] px-4 py-3 align-middle">
                      <p className="truncate font-medium text-slate-900">
                        {row.title}
                      </p>
                      <p className="truncate font-mono text-xs text-slate-500">
                        {row.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <CourseStatusBadge status={row.status} />
                    </td>
                    <td className="hidden px-4 py-3 align-middle capitalize text-slate-600 sm:table-cell">
                      {row.structure_type === 'linear' ? 'Lineal' : 'Modular'}
                    </td>
                    <td className="hidden px-4 py-3 align-middle tabular-nums text-slate-600 md:table-cell">
                      {row.lessonCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-xs text-slate-500">
                      {new Date(row.updated_at).toLocaleString('es')}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                        <Link
                          to={`/admin/cursos/${row.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Editar
                        </Link>
                        <Link
                          to={`/admin/cursos/${row.id}/builder`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Builder
                        </Link>
                        <a
                          href={`/aprender/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Preview
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
