import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCoursesRepo } from '@/lib/courses/adminCoursesRepo';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

/**
 * Una sola creación en vuelo compartida entre montajes (p. ej. React Strict Mode).
 * Evita dos borradores y garantiza que el efecto activo pueda navegar al resolver.
 */
let draftCreationInFlight: Promise<{ courseId: string }> | null = null;

function getOrCreateDraftCourse(): Promise<{ courseId: string }> {
  if (!draftCreationInFlight) {
    draftCreationInFlight = adminCoursesRepo
      .createDraftCourse()
      .finally(() => {
        draftCreationInFlight = null;
      });
  }
  return draftCreationInFlight;
}

export function AdminCourseNewPage() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOrCreateDraftCourse()
      .then(({ courseId }) => {
        if (!cancelled) {
          navigate(`/admin/cursos/${courseId}`, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (failed) {
    return (
      <ErrorState
        title="No se pudo crear el curso"
        description="Intenta de nuevo o revisa la consola del navegador."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <LoadingSkeleton variant="sidebar" rows={2} />
      <p className="text-sm font-medium text-slate-800">Creando borrador…</p>
      <p className="text-sm text-slate-600">
        En el siguiente paso podrás subir la portada del curso (arrastra o elige
        archivo), abrir el constructor y adjuntar PDF u otros recursos en cada
        lección.
      </p>
    </div>
  );
}
