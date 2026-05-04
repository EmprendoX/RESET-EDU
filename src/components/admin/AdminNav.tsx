import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  FileImage,
  LayoutDashboard,
  ScrollText,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  );

export function AdminNav() {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Administración">
      <NavLink to="/admin" end className={linkClass}>
        <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
        Resumen
      </NavLink>
      <NavLink to="/admin/cursos" className={linkClass}>
        <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
        Cursos
      </NavLink>
      <NavLink to="/admin/media" className={linkClass}>
        <FileImage className="h-4 w-4 shrink-0" aria-hidden />
        Media
      </NavLink>
      <NavLink to="/admin/matriculas" className={linkClass}>
        <Users className="h-4 w-4 shrink-0" aria-hidden />
        Matrículas
      </NavLink>
      <NavLink to="/admin/reportes" className={linkClass}>
        <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
        Reportes
      </NavLink>
      <NavLink to="/admin/logs" className={linkClass}>
        <ScrollText className="h-4 w-4 shrink-0" aria-hidden />
        Logs
      </NavLink>
    </nav>
  );
}
