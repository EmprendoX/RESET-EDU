export type UserRole = 'visitor' | 'student' | 'course_admin' | 'superadmin';

export interface AppUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
}
