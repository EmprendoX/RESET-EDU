import { MockMediaLibrary } from '@/components/admin/MockMediaLibrary';

export function AdminMediaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Biblioteca de archivos
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Demo local: sin Supabase Storage. Copia URLs blob al campo PDF/archivo
          del editor de lección.
        </p>
      </div>
      <MockMediaLibrary />
    </div>
  );
}
