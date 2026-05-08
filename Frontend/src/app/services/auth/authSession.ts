import type { AuthenticatedUser, UserRole } from '../../types/user';
import type { AuthSession, VerifyMagicLinkResponse } from './authTypes';

const authSessionStorageKey = 'compensa.auth.session';
const activeRoleStorageKey = 'compensa.auth.activeRole';

const normalizeRole = (role: string): UserRole => {
  const normalized = role.toLowerCase();

  if (normalized === 'coordinator' || normalized === 'admin' || normalized === 'student') {
    return normalized;
  }

  return 'teacher';
};

export const mapVerifyResponseToSession = (response: VerifyMagicLinkResponse): AuthSession => ({
  accessToken: response.accessToken,
  accessTokenExpiresAt: response.accessTokenExpiresAt,
  user: {
    id: response.userId,
    email: response.email ?? '',
    name: response.fullName || response.email || 'Compensa User',
    roles: response.roles,
  },
});

export const mapSessionToUser = (session: AuthSession): AuthenticatedUser => {
  const roles = session.user.roles.map(normalizeRole);
  const storedActiveRole = getStoredActiveRole();
  const activeRole = storedActiveRole && roles.includes(storedActiveRole)
    ? storedActiveRole
    : roles[0] ?? 'teacher';

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: activeRole,
    roles,
  };
};

export const saveAuthSession = (session: AuthSession) => {
  localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
};

export const getStoredAuthSession = (): AuthSession | null => {
  const rawSession = localStorage.getItem(authSessionStorageKey);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;
    const expiresAt = new Date(session.accessTokenExpiresAt).getTime();

    if (!session.accessToken || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      clearAuthSession();
      return null;
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const getStoredAccessToken = (): string | null => {
  return getStoredAuthSession()?.accessToken ?? null;
};

export const clearAuthSession = () => {
  localStorage.removeItem(authSessionStorageKey);
  localStorage.removeItem(activeRoleStorageKey);
};

export const saveActiveRole = (role: UserRole) => {
  localStorage.setItem(activeRoleStorageKey, role);
};

const getStoredActiveRole = (): UserRole | null => {
  const role = localStorage.getItem(activeRoleStorageKey);

  if (!role) {
    return null;
  }

  return normalizeRole(role);
};
