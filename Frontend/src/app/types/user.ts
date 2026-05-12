export type UserRole = 'teacher' | 'coordinator' | 'admin' | 'student';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  avatarUrl?: string;
}

export type User = AuthenticatedUser;

export interface ImportedUser {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
