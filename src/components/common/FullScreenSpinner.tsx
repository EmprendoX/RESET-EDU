interface Props {
  label?: string;
  tone?: 'light' | 'dark';
}

export function FullScreenSpinner({ label = 'Cargando…', tone = 'light' }: Props) {
  const isDark = tone === 'dark';
  return (
    <div
      className={
        isDark
          ? 'reset-dark flex h-[100dvh] items-center justify-center bg-reset-bg-0 font-body'
          : 'flex h-[100dvh] items-center justify-center bg-slate-50'
      }
    >
      <div
        className={
          isDark
            ? 'flex flex-col items-center gap-3 text-reset-text-muted'
            : 'flex flex-col items-center gap-3 text-slate-500'
        }
      >
        <div
          className={
            isDark
              ? 'h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400'
              : 'h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600'
          }
        />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
