interface Props {
  label?: string;
}

export function FullScreenSpinner({ label = 'Cargando…' }: Props) {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
