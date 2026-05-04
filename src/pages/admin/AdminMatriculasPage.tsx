import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  grantEnrollment,
  listCoursesForEnrollmentPicker,
  listEnrollmentsAdmin,
  revokeEnrollment,
  searchProfilesByEmail,
  type EnrollmentAdminRow,
} from '@/lib/enrollments/enrollmentsAdminRepo';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { queryKeys } from '@/hooks/queryKeys';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils/cn';

export function AdminMatriculasPage() {
  const qc = useQueryClient();
  const supabaseOk = isSupabaseConfigured() && Boolean(getSupabase());

  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [pickerEmail, setPickerEmail] = useState('');
  const [pickerUserId, setPickerUserId] = useState<string | null>(null);
  const [pickerCourseId, setPickerCourseId] = useState('');

  const listQ = useQuery({
    queryKey: queryKeys.admin.enrollments(),
    queryFn: listEnrollmentsAdmin,
    enabled: supabaseOk,
  });

  const coursesQ = useQuery({
    queryKey: [...queryKeys.admin.courses(), 'enrollment-picker'],
    queryFn: listCoursesForEnrollmentPicker,
    enabled: supabaseOk,
  });

  const searchQ = useQuery({
    queryKey: ['admin', 'profile-search', pickerEmail],
    queryFn: () => searchProfilesByEmail(pickerEmail),
    enabled: supabaseOk && pickerEmail.trim().length >= 3,
  });

  const revokeM = useMutation({
    mutationFn: ({
      userId,
      courseId,
    }: {
      userId: string;
      courseId: string;
    }) => revokeEnrollment(userId, courseId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.enrollments() });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
      void qc.invalidateQueries({ queryKey: ['catalog'] });
    },
  });

  const grantM = useMutation({
    mutationFn: ({
      userId,
      courseId,
    }: {
      userId: string;
      courseId: string;
    }) => grantEnrollment(userId, courseId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.enrollments() });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.courses() });
      void qc.invalidateQueries({ queryKey: ['catalog'] });
      setPickerUserId(null);
      setPickerCourseId('');
      setPickerEmail('');
    },
  });

  const filterCourseChoices = useMemo(() => {
    const map = new Map<string, string>();
    (coursesQ.data ?? []).forEach((c) => map.set(c.id, c.title));
    (listQ.data ?? []).forEach((r) => {
      if (!map.has(r.course_id)) map.set(r.course_id, r.course_title);
    });
    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'es'),
    );
  }, [coursesQ.data, listQ.data]);

  const filteredRows = useMemo(() => {
    const rows = listQ.data ?? [];
    if (courseFilter === 'all') return rows;
    return rows.filter((r) => r.course_id === courseFilter);
  }, [listQ.data, courseFilter]);

  const tableFilterEmail = emailSearch.trim().toLowerCase();

  const visibleRows = useMemo(() => {
    if (!tableFilterEmail) return filteredRows;
    return filteredRows.filter(
      (r) =>
        (r.user_email ?? '').toLowerCase().includes(tableFilterEmail) ||
        (r.user_full_name ?? '').toLowerCase().includes(tableFilterEmail),
    );
  }, [filteredRows, tableFilterEmail]);

  if (!supabaseOk) {
    return (
      <div className="surface-card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Matrículas</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configura <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code>{' '}
          y{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>{' '}
          para gestionar accesos desde aquí.
        </p>
      </div>
    );
  }

  if (listQ.isPending || coursesQ.isPending) {
    return <LoadingSkeleton variant="sidebar" rows={10} />;
  }

  if (listQ.isError) {
    return (
      <ErrorState
        title="No se pudieron cargar las matrículas"
        onRetry={() => void listQ.refetch()}
      />
    );
  }

  const courseOptions = coursesQ.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Matrículas y accesos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Otorga o revoca acceso a cursos de pago. Los cursos marcados como{' '}
          <strong>gratis</strong> no requieren fila en matrículas.
        </p>
      </header>

      <section className="surface-card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-slate-900">Añadir acceso</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600" htmlFor="pick-email">
              Buscar alumno por email
            </label>
            <input
              id="pick-email"
              type="search"
              value={pickerEmail}
              onChange={(e) => {
                setPickerEmail(e.target.value);
                setPickerUserId(null);
              }}
              placeholder="mín. 3 caracteres"
              className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              autoComplete="off"
            />
            {searchQ.data && searchQ.data.length > 0 ? (
              <ul className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white text-sm">
                {searchQ.data.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full px-3 py-2 text-left transition hover:bg-slate-50',
                        pickerUserId === p.id && 'bg-brand-50',
                      )}
                      onClick={() => setPickerUserId(p.id)}
                    >
                      <span className="font-medium text-slate-900">
                        {p.email ?? 'sin email'}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {p.full_name || '—'} · {p.role}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : pickerEmail.trim().length >= 3 && searchQ.isSuccess ? (
              <p className="text-xs text-slate-500">Sin resultados.</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600" htmlFor="pick-course">
              Curso publicado
            </label>
            <select
              id="pick-course"
              value={pickerCourseId}
              onChange={(e) => setPickerCourseId(e.target.value)}
              className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Selecciona curso…</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {c.is_free ? ' (gratis — no requiere matrícula)' : ''}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={
                !pickerUserId ||
                !pickerCourseId ||
                grantM.isPending ||
                courseOptions.find((c) => c.id === pickerCourseId)?.is_free === true
              }
              onClick={() => {
                if (!pickerUserId || !pickerCourseId) return;
                const free = courseOptions.find((c) => c.id === pickerCourseId)?.is_free;
                if (free) return;
                grantM.mutate({ userId: pickerUserId, courseId: pickerCourseId });
              }}
            >
              {grantM.isPending ? 'Guardando…' : 'Dar acceso'}
            </Button>
            {grantM.isError ? (
              <p className="text-xs text-red-600">
                {(grantM.error as Error)?.message ?? 'No se pudo crear la matrícula.'}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-card space-y-4 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600" htmlFor="flt-course">
              Filtrar por curso
            </label>
            <select
              id="flt-course"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              {filterCourseChoices.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px] flex-1 space-y-1">
            <label className="text-xs font-medium text-slate-600" htmlFor="flt-email">
              Buscar en tabla (email / nombre)
            </label>
            <input
              id="flt-email"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No hay matrículas que coincidan.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row: EnrollmentAdminRow) => (
                  <tr key={`${row.user_id}-${row.course_id}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {row.user_email ?? '—'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {row.user_full_name ?? ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{row.course_title}</div>
                      <div className="text-xs text-slate-500">
                        {row.course_slug}
                        {row.course_is_free ? (
                          <span className="ml-2 text-emerald-700">gratis</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(row.created_at).toLocaleString('es')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.course_is_free ? (
                        <span className="text-xs text-slate-400">N/A</span>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={revokeM.isPending}
                          onClick={() =>
                            revokeM.mutate({
                              userId: row.user_id,
                              courseId: row.course_id,
                            })
                          }
                        >
                          Quitar acceso
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
