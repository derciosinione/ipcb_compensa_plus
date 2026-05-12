import type { AuthenticatedUser, UserRole } from "../../types/user";
import type { AuthSession, VerifyMagicLinkResponse } from "./authTypes";

const authSessionStorageKey = "compensa.auth.session";
const activeRoleStorageKey = "compensa.auth.activeRole";

const normalizeRole = (role: string): UserRole => {
  const normalized = role.toLowerCase();

  if (
    normalized === "coordinator" ||
    normalized === "admin" ||
    normalized === "student"
  ) {
    return normalized;
  }

  return "teacher";
};

export const mapVerifyResponseToSession = (
  response: VerifyMagicLinkResponse,
): AuthSession => ({
  accessToken: response.accessToken,
  accessTokenExpiresAt: response.accessTokenExpiresAt,
  refreshToken: response.refreshToken,
  refreshTokenExpiresAt: response.refreshTokenExpiresAt,
  user: {
    id: response.userId,
    email: response.email ?? "",
    name: response.fullName || response.email || "Compensa User",
    roles: response.roles,
  },
});

export const mapSessionToUser = (session: AuthSession): AuthenticatedUser => {
  const roles = session.user.roles.map(normalizeRole);
  const storedActiveRole = getStoredActiveRole();
  const activeRole =
    storedActiveRole && roles.includes(storedActiveRole)
      ? storedActiveRole
      : (roles[0] ?? "teacher");

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
    const refreshTokenExpiresAt = new Date(
      session.refreshTokenExpiresAt,
    ).getTime();

    // Only clear if the refresh token itself is expired or missing
    if (
      !session.refreshToken ||
      Number.isNaN(refreshTokenExpiresAt) ||
      refreshTokenExpiresAt <= Date.now()
    ) {
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
  const session = getStoredAuthSession();
  if (!session) return null;

  const accessTokenExpiresAt = new Date(session.accessTokenExpiresAt).getTime();
  if (accessTokenExpiresAt <= Date.now()) {
    // Access token is expired, but session is returned because refresh token is valid.
    // The interceptor will handle the refresh.
    return null;
  }

  return session.accessToken;
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
