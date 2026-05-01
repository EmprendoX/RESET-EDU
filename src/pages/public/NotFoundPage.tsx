import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Página no encontrada
      </h1>
      <p className="text-sm text-slate-500">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/">
        <Button variant="outline">Volver al inicio</Button>
      </Link>
    </main>
  );
}
