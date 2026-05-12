import { getStoredAccessToken } from '../auth/authSession';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  accessToken?: string;
  authenticated?: boolean;
}

type QueryValue = string | number | boolean | null | undefined;

const defaultApiUrl = 'http://localhost:5005';
export const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? defaultApiUrl;

// For backward compatibility while refactoring other files
export const identityApiBaseUrl = API_BASE_URL;
export const coreApiBaseUrl = API_BASE_URL;

export const apiRequest = async <T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const headers = new Headers(options.headers);
  const accessToken = options.accessToken ?? (options.authenticated ? getRequiredAccessToken() : undefined);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => undefined)) as ApiResponse<T> | undefined;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.errors,
    );
  }

  return payload ?? { success: true, message: '' };
};

export const authenticatedApiRequest = <T>(
  baseUrl: string,
  path: string,
  options: Omit<RequestOptions, 'authenticated'> = {},
) => apiRequest<T>(baseUrl, path, { ...options, authenticated: true });

export const buildApiPath = (path: string, query?: Record<string, QueryValue>) => {
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

const getRequiredAccessToken = () => {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    throw new Error('You need to sign in again.');
  }

  return accessToken;
};
