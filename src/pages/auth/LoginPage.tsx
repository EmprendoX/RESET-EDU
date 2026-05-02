import { useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getSafeNextParam } from '@/lib/auth/loginRedirect';
import { mapAuthError } from '@/lib/auth/mapAuthError';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner } from '@/components/common';

type Mode = 'signin' | 'signup';

const MIN_PASSWORD = 6;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, authReady } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(() =>
    searchParams.get('signedOut') === '1' ? 'Sesión cerrada.' : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextParam = searchParams.get('next');
  const targetPath = getSafeNextParam(nextParam);

  useEffect(() => {
    if (searchParams.get('signedOut') !== '1') return;
    const next = new URLSearchParams(searchParams);
    next.delete('signedOut');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  if (!isSupabaseConfigured()) {
    return <Navigate to="/" replace />;
  }

  if (!authReady) {
    return <FullScreenSpinner label="Cargando sesión…" />;
  }

  if (isAuthenticated) {
    return <Navigate to={targetPath} replace />;
  }

  function validateForm(): string | null {
    const e = email.trim();
    if (!e || !e.includes('@')) {
      return 'Introduce un correo electrónico válido.';
    }
    if (password.length < MIN_PASSWORD) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    }
    return null;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    const v = validateForm();
    if (v) {
      setErrorMessage(v);
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setSubmitting(true);
    try {
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMessage(mapAuthError(error));
        return;
      }
      setInfoMessage('Sesión iniciada.');
      navigate(targetPath, { replace: true });
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    const v = validateForm();
    if (v) {
      setErrorMessage(v);
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setSubmitting(true);
    try {
      const redirect = `${window.location.origin}/login`;
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirect },
      });
      if (error) {
        setErrorMessage(mapAuthError(error));
        return;
      }
      if (data.session) {
        setInfoMessage('Cuenta creada. Ya puedes usar la app.');
        navigate(targetPath, { replace: true });
        return;
      }
      setInfoMessage(
        'Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
      );
      setPassword('');
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
          {mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === 'signin'
            ? 'Accede con tu correo y contraseña.'
            : 'Regístrate con correo y contraseña.'}
        </p>
      </div>

      <div className="mb-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'signin'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => {
            setMode('signin');
            setErrorMessage(null);
            setInfoMessage(null);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            mode === 'signup'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => {
            setMode('signup');
            setErrorMessage(null);
            setInfoMessage(null);
          }}
        >
          Crear cuenta
        </button>
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
        onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="login-email"
            className="mb-1 block text-xs font-medium text-slate-700"
          >
            Correo
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="mb-1 block text-xs font-medium text-slate-700"
          >
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete={
              mode === 'signin' ? 'current-password' : 'new-password'
            }
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="focus-ring w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm"
            required
            minLength={MIN_PASSWORD}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={submitting}
        >
          {mode === 'signin' ? 'Entrar' : 'Registrarse'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
