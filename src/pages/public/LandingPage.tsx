import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Stub landing page. Out of scope for this phase. Used only as an entry point
 * to navigate into the Aula demo course.
 */
export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-ai-100 bg-ai-50 px-3 py-1 text-xs font-medium text-ai-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Demo del Aula Inteligente — sin backend
      </div>
      <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        Aprende con cursos prácticos y un mentor IA aplicado a tu negocio.
      </h1>
      <p className="text-balance max-w-prose text-base text-slate-600 md:text-lg">
        Esta vista es solo el punto de entrada al Aula. La homepage y el
        catálogo se construirán en una fase posterior.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Link to="/aprender/marketing-con-ia">
          <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Abrir Aula de demo
          </Button>
        </Link>
        <Link
          to="/dashboard"
          className="focus-ring text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Dashboard alumno
        </Link>
        <Link
          to="/mi-negocio"
          className="focus-ring text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
        >
          Mi negocio
        </Link>
      </div>
      <p className="text-xs text-slate-400">
        ¿Construyendo contenido?{' '}
        <Link to="/admin" className="text-brand-600 hover:text-brand-700">
          Panel admin (demo)
        </Link>
      </p>
    </main>
  );
}
