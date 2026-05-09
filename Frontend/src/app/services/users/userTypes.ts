export type UserRole = 'Admin' | 'Coordinator' | 'Teacher' | 'Student';

export interface PlatformUser {
  id: string;
  email: string;
  fullName?: string | null;
  roles: UserRole[];
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleOption {
  name: UserRole;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  roles: UserRole[];
}
