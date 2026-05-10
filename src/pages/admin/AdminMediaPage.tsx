import { LessonAssetsLibrary } from '@/components/admin/LessonAssetsLibrary';

export function AdminMediaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Biblioteca de archivos
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Todos los archivos de las lecciones (PDF, PPT…). Sube nuevos
          desde el editor de cada lección. Los privados se sirven con URL
          firmada temporal al hacer clic en <strong>Abrir</strong>.
        </p>
      </div>
      <LessonAssetsLibrary />
    </div>
  );
}
