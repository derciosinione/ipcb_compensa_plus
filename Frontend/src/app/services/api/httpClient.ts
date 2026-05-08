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
}

const defaultIdentityApiUrl = 'http://localhost:5002';
const defaultCoreApiUrl = 'http://localhost:5001';

export const identityApiBaseUrl =
  import.meta.env.VITE_IDENTITY_API_URL?.replace(/\/$/, '') ?? defaultIdentityApiUrl;
export const coreApiBaseUrl =
  import.meta.env.VITE_CORE_API_URL?.replace(/\/$/, '') ?? defaultCoreApiUrl;

export const apiRequest = async <T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
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
