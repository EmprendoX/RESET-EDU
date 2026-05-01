import { useLocation } from 'react-router-dom';
import { getAdminSectionTitle } from '@/config/adminRouteTitles';

export function AdminTopBar() {
  const { pathname } = useLocation();
  const title = getAdminSectionTitle(pathname);

  return (
    <header className="sticky top-0 z-10 hidden shrink-0 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm lg:block">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Panel
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
