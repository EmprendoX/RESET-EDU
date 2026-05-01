import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_ROLES = new Set(['course_admin', 'superadmin']);

interface Props {
  children: React.ReactNode;
}

export function RequireAdminRoute({ children }: Props) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !ADMIN_ROLES.has(user.role)) {
    return (
      <Navigate to="/404" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
