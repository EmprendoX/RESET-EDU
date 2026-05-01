import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { env } from '@/config/env';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {env.appName}
          </p>
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-slate-100 p-3">
          <Link
            to="/"
            className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al sitio
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-slate-900">Admin</span>
          <Link
            to="/"
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Sitio
          </Link>
        </header>
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <AdminNav />
        </div>
        <AdminTopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
