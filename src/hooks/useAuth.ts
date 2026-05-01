import type { AppUser } from '@/types/auth';
import { MOCK_USER_ID } from '@/data/mockBusinessProfile';

const MOCK_ROLE: AppUser['role'] =
  import.meta.env.VITE_MOCK_USER_ROLE === 'student'
    ? 'student'
    : 'course_admin';

const MOCK_USER: AppUser = {
  id: MOCK_USER_ID,
  email: 'demo@reset-edu.app',
  full_name: MOCK_ROLE === 'course_admin' ? 'Admin Demo' : 'Alumno Demo',
  avatar_url: undefined,
  role: MOCK_ROLE,
};

/**
 * Mock auth hook. Always returns the demo user. Replace with real Supabase auth
 * in a later phase — the public shape stays the same.
 */
export function useAuth(): { user: AppUser; isAuthenticated: boolean } {
  return { user: MOCK_USER, isAuthenticated: true };
}
