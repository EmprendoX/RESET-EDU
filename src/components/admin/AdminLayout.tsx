import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { env } from '@/config/env';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export function AdminLayout() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const showSignOut = isSupabaseConfigured();

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    setSigningOut(true);
    try {
      await sb.auth.signOut();
      navigate('/?signedOut=1', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

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
        <div className="mt-auto space-y-1 border-t border-slate-100 p-3">
          <Link
            to="/"
            className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al sitio
          </Link>
          {showSignOut ? (
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Cerrar sesión
            </button>
          ) : null}
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
