import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ZodError } from 'zod';
import { ChevronRight } from 'lucide-react';
import {
  businessProfileFormSchema,
  type BusinessProfileFormInput,
} from '@/lib/business/businessProfileSchema';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FullScreenSpinner, LoadingSkeleton } from '@/components/common';
import { ErrorState } from '@/components/common/ErrorState';
import { buildLoginUrl } from '@/lib/auth/loginRedirect';
import { isSupabaseConfigured } from '@/lib/supabase/client';

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="md:col-span-2">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function BusinessProfilePage() {
  const location = useLocation();
  const { isAuthenticated, authReady } = useAuth();
  const {
    profile,
    isLoading,
    isError,
    refetch,
    saveProfile,
    isSaving,
    saveError,
  } = useBusinessProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessProfileFormInput>({
    defaultValues: {
      business_name: '',
      industry: '',
      business_model: '',
      target_customer: '',
      main_goal: '',
      main_challenge: '',
      current_stage: '',
      country: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      business_name: profile.business_name,
      industry: profile.industry,
      business_model: profile.business_model,
      target_customer: profile.target_customer,
      main_goal: profile.main_goal,
      main_challenge: profile.main_challenge,
      current_stage: profile.current_stage,
      country: profile.country,
      notes: profile.notes ?? '',
    });
  }, [profile, reset]);

  if (!authReady) {
    return <FullScreenSpinner label="Cargando sesión…" />;
  }
  if (!isAuthenticated) {
    if (isSupabaseConfigured()) {
      return (
        <Navigate
          to={buildLoginUrl(location.pathname, location.search)}
          replace
        />
      );
    }
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: BusinessProfileFormInput) {
    const parsed = businessProfileFormSchema.safeParse(values);
    if (!parsed.success) return;
    await saveProfile(parsed.data);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <LoadingSkeleton variant="sidebar" rows={6} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="No pudimos cargar tu perfil"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const saveErr =
    saveError instanceof ZodError
      ? saveError.errors.map((e) => e.message).join(' ')
      : saveError instanceof Error
        ? saveError.message
        : saveError
          ? 'No se pudo guardar.'
          : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link to="/dashboard" className="hover:text-slate-800">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="text-slate-800">Mi negocio</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Perfil de negocio
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Datos que usa el mentor IA para personalizar respuestas (mock local;
          migrará a Supabase).
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="surface-panel space-y-8 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <SectionTitle
            title="General"
            description="Identidad de tu proyecto o empresa."
          />
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Nombre del negocio
            </label>
            <input
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('business_name')}
            />
            {errors.business_name ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.business_name.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Industria / sector
            </label>
            <input
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('industry')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              País / mercado
            </label>
            <input
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('country')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Modelo de negocio
            </label>
            <textarea
              rows={2}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('business_model')}
            />
          </div>

          <SectionTitle
            title="Cliente y mercado"
            description="A quién sirves y cómo te diferencias."
          />
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Cliente objetivo
            </label>
            <textarea
              rows={3}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('target_customer')}
            />
          </div>

          <SectionTitle
            title="Objetivos"
            description="Prioridades y fricciones actuales."
          />
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Objetivo principal
            </label>
            <textarea
              rows={2}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('main_goal')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Reto principal
            </label>
            <textarea
              rows={2}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('main_challenge')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Etapa del negocio
            </label>
            <input
              className="focus-ring mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('current_stage')}
              placeholder="p. ej. Idea, validación, crecimiento…"
            />
          </div>

          <SectionTitle
            title="Notas internas"
            description="Contexto extra para el mentor (opcional)."
          />
          <div className="md:col-span-2">
            <textarea
              rows={4}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              {...register('notes')}
              placeholder="Equipo, herramientas, restricciones…"
            />
          </div>
        </div>

        {saveErr ? (
          <p className="text-sm text-rose-600">{saveErr}</p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <Link
            to="/dashboard"
            className="focus-ring inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Volver al dashboard
          </Link>
          <Button type="submit" loading={isSaving}>
            Guardar perfil
          </Button>
        </div>
      </form>
    </div>
  );
}
