import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mapAuthError } from '@/lib/auth/mapAuthError';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner } from '@/components/common';

/**
 * FR-005 — Recuperación de contraseña.
 * Reusa `supabase.auth.resetPasswordForEmail` y patrón de LoginPage.
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authReady } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return <Navigate to="/" replace />;
  }
  if (!authReady) {
    return <FullScreenSpinner label="Cargando sesión…" />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      setErrorMessage('Introduce un correo electrónico válido.');
      return;
    }
    const sb = getSupabase();
    if (!sb) return;

    setSubmitting(true);
    try {
      const base = (env.publicAppOrigin ?? window.location.origin).replace(
        /\/$/,
        '',
      );
      const redirectTo = `${base}/login`;
      const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (error) {
        setErrorMessage(mapAuthError(error));
        return;
      }
      setInfoMessage(
        'Si existe una cuenta con ese correo, te enviamos instrucciones para recuperar tu contraseña.',
      );
      setEmail('');
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Te enviaremos un correo con un enlace para restablecerla.
        </p>
      </div>

      {infoMessage ? (
        <div
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-1 block text-xs font-medium text-slate-700"
          >
            Correo
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            loading={submitting}
          >
            Enviar instrucciones
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            size="lg"
            onClick={() => navigate('/login')}
          >
            Cancelar
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link
          to="/login"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </main>
  );
}
