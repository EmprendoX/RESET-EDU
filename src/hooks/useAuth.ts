import { useEffect, useState } from 'react';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { AppUser, UserRole } from '@/types/auth';
import { MOCK_USER_ID } from '@/data/mockBusinessProfile';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

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

const VISITOR_USER: AppUser = {
  id: '__visitor__',
  email: '',
  role: 'visitor',
};

function mapDbRoleToUserRole(dbRole: string | undefined | null): UserRole {
  if (dbRole === 'course_admin' || dbRole === 'superadmin') return dbRole;
  return 'student';
}

function sessionToAppUser(
  sessionUser: User,
  profileRole: string | null | undefined,
): AppUser {
  const meta = sessionUser.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    (typeof meta?.full_name === 'string' ? meta.full_name : undefined) ??
    (typeof meta?.name === 'string' ? meta.name : undefined);
  const avatarUrl =
    typeof meta?.avatar_url === 'string' ? meta.avatar_url : undefined;
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    full_name: fullName,
    avatar_url: avatarUrl,
    role: mapDbRoleToUserRole(profileRole),
  };
}

/**
 * Con `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` usa sesión Supabase + `profiles`.
 * Sin env, mantiene el usuario demo (mock).
 */
export function useAuth(): {
  user: AppUser;
  isAuthenticated: boolean;
  authReady: boolean;
} {
  const useRemote = isSupabaseConfigured();
  const [user, setUser] = useState<AppUser>(() =>
    useRemote ? VISITOR_USER : MOCK_USER,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() => !useRemote);
  const [authReady, setAuthReady] = useState(() => !useRemote);

  useEffect(() => {
    if (!useRemote) {
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      setAuthReady(true);
      return;
    }

    const client = getSupabase();
    if (!client) {
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    async function syncFromSession(
      supabase: SupabaseClient,
      session: Session | null,
    ) {
      if (cancelled) return;
      if (!session?.user) {
        setUser(VISITOR_USER);
        setIsAuthenticated(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (cancelled) return;
      const roleStr =
        data && typeof data === 'object' && 'role' in data
          ? String((data as { role: unknown }).role)
          : null;
      setUser(sessionToAppUser(session.user, roleStr));
      setIsAuthenticated(true);
    }

    void (async () => {
      const {
        data: { session },
      } = await client.auth.getSession();
      await syncFromSession(client, session);
      if (!cancelled) setAuthReady(true);
    })();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        await syncFromSession(client, session);
        if (!cancelled) setAuthReady(true);
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [useRemote]);

  return { user, isAuthenticated, authReady };
}
