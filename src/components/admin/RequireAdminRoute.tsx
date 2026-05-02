import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullScreenSpinner } from '@/components/common';
import { buildLoginUrl } from '@/lib/auth/loginRedirect';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const ADMIN_ROLES = new Set(['course_admin', 'superadmin']);

interface Props {
  children: React.ReactNode;
}

export function RequireAdminRoute({ children }: Props) {
  const { user, isAuthenticated, authReady } = useAuth();
  const location = useLocation();

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
    return (
      <Navigate to="/404" replace state={{ from: location.pathname }} />
    );
  }

  if (!ADMIN_ROLES.has(user.role)) {
    return (
      <Navigate to="/404" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
