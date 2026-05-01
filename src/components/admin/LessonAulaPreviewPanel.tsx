import type { LessonFormValues } from '@/types/admin';
import { AdminFileTypeBadge } from '@/components/admin/AdminFileTypeBadge';
import { cn } from '@/lib/utils/cn';

interface Props {
  courseTitle: string;
  values: LessonFormValues;
  className?: string;
}

function previewText(text: string, max = 280) {
  const t = text.trim();
  if (!t) return null;
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function LessonAulaPreviewPanel({ courseTitle, values, className }: Props) {
  const body = previewText(values.content_text ?? '');
  const desc = previewText(values.description ?? '', 160);

  return (
    <div
      className={cn(
        'surface-panel space-y-4 border border-dashed border-slate-200 bg-slate-50/60 p-5',
        className,
      )}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Vista previa del aula
        </p>
        <p className="mt-1 text-xs text-slate-500">{courseTitle}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <AdminFileTypeBadge type={values.file_type ?? 'text'} />
          {values.is_preview ? (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
              Preview
            </span>
          ) : null}
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase',
              values.status === 'published'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-slate-100 text-slate-600',
            )}
          >
            {values.status === 'published' ? 'Publicada' : 'Borrador'}
          </span>
          <span className="text-xs text-slate-500">
            {values.duration_minutes ? `${values.duration_minutes} min` : '— min'}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-900">
          {values.title?.trim() || 'Sin título'}
        </h3>

        {desc ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">Sin descripción</p>
        )}

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500">Contenido</p>
          {body ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {body}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">Sin texto principal</p>
          )}
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
          <li>
            <span className="font-medium text-slate-500">Vídeo: </span>
            {values.video_url?.trim() ? (
              <span className="break-all font-mono text-[11px] text-slate-800">
                {values.video_url.trim()}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </li>
          <li>
            <span className="font-medium text-slate-500">PDF: </span>
            {values.pdf_url?.trim() ? (
              <span className="break-all font-mono text-[11px] text-slate-800">
                {values.pdf_url.trim()}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </li>
          <li>
            <span className="font-medium text-slate-500">Archivo / PPT: </span>
            {values.file_url?.trim() ? (
              <span className="break-all font-mono text-[11px] text-slate-800">
                {values.file_url.trim()}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </li>
        </ul>

        {values.ai_context?.trim() ? (
          <div className="mt-4 rounded-lg bg-violet-50/80 px-3 py-2 text-xs text-violet-900">
            <p className="font-semibold text-violet-800">Contexto IA (resumen)</p>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap">
              {values.ai_context.trim()}
            </p>
          </div>
        ) : null}
      </div>

      <p className="text-[11px] leading-snug text-slate-500">
        Maqueta orientativa: no replica el visor del aula. Usa «Vista alumno» para
        comprobar la experiencia real.
      </p>
    </div>
  );
}
