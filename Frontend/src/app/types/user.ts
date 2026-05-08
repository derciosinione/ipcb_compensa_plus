export type { UserRole } from '../mocks/data';

import type { UserRole } from '../mocks/data';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  avatarUrl?: string;
}
