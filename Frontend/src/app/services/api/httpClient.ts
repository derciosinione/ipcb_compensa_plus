import {
  getStoredAccessToken,
  getStoredAuthSession,
  saveAuthSession,
  clearAuthSession,
  mapVerifyResponseToSession,
  getStoredActiveRole,
} from "../auth/authSession";
import type { VerifyMagicLinkResponse } from "../auth/authTypes";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  accessToken?: string;
  authenticated?: boolean;
}

type QueryValue = string | number | boolean | null | undefined;

const defaultApiUrl = "http://localhost:5005";
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? defaultApiUrl;

// For backward compatibility while refactoring other files
export const identityApiBaseUrl = API_BASE_URL;
export const coreApiBaseUrl = API_BASE_URL;

let refreshPromise: Promise<string | null> | null = null;

export const apiRequest = async <T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  let accessToken =
    options.accessToken ??
    (options.authenticated ? getStoredAccessToken() : undefined);

  // If authenticated but no access token (likely expired), try to refresh immediately
  if (options.authenticated && !accessToken) {
    accessToken = (await handleTokenRefresh()) ?? undefined;
    if (!accessToken) {
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  const executeRequest = async (token?: string): Promise<Response> => {
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type") && options.body) {
      if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const activeRole = getStoredActiveRole();
    if (activeRole) {
      headers.set("X-Active-Role", activeRole);
    }

    return fetch(`${baseUrl}${path}`, { cache: "no-store", ...options, headers });
  };

  let response = await executeRequest(accessToken);

  // Handle 401: Attempt to refresh and retry
  if (response.status === 401 && options.authenticated) {
    const newToken = await handleTokenRefresh();
    if (newToken) {
      response = await executeRequest(newToken);
    }
  }

  const payload = (await response.json().catch(() => undefined)) as
    | ApiResponse<T>
    | undefined;

  if (!response.ok || payload?.success === false) {
    // If we still get a 401 after retry, clear session
    if (response.status === 401 && options.authenticated) {
      clearAuthSession();
      window.dispatchEvent(new Event("auth:logout"));
    }

    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.errors,
    );
  }

  return payload ?? ({ success: true, message: "" } as ApiResponse<T>);
};

const handleTokenRefresh = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const session = getStoredAuthSession();
  if (!session?.refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${identityApiBaseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const payload =
        (await response.json()) as ApiResponse<VerifyMagicLinkResponse>;
      if (!payload.success || !payload.data) {
        throw new Error(payload.message || "Refresh failed");
      }

      const newSession = mapVerifyResponseToSession(payload.data);
      saveAuthSession(newSession);

      return newSession.accessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      clearAuthSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const authenticatedApiRequest = <T>(
  baseUrl: string,
  path: string,
  options: Omit<RequestOptions, "authenticated"> = {},
) => apiRequest<T>(baseUrl, path, { ...options, authenticated: true });

export const buildApiPath = (
  path: string,
  query?: Record<string, QueryValue>,
) => {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    const serializedValue = String(value).trim();

    if (serializedValue) {
      params.set(key, serializedValue);
    }
  });

  return params.size ? `${path}?${params.toString()}` : path;
};
