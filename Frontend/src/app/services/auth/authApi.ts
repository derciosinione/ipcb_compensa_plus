import { apiRequest, identityApiBaseUrl } from '../api/httpClient';
import type { LoginResponse, VerifyMagicLinkResponse } from './authTypes';

export const requestMagicLink = async (email: string) => {
  const response = await apiRequest<LoginResponse>(identityApiBaseUrl, '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  return response.data;
};

export const verifyMagicLink = async (token: string) => {
  const response = await apiRequest<VerifyMagicLinkResponse>(
    identityApiBaseUrl,
    `/api/auth/verify?token=${encodeURIComponent(token)}`,
  );

  return response.data;
};

export const refreshAuthToken = async (accessToken: string, refreshToken: string) => {
  const response = await apiRequest<VerifyMagicLinkResponse>(
    identityApiBaseUrl,
    '/api/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ accessToken, refreshToken }),
    }
  );

  return response.data;
};
