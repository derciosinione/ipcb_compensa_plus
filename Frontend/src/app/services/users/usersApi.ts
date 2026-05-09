import { authenticatedApiRequest, buildApiPath, identityApiBaseUrl } from '../api/httpClient';
import type { CreateUserRequest, PlatformUser, RoleOption, UserRole } from './userTypes';

export const listUsers = async (search?: string) => {
  const response = await authenticatedApiRequest<PlatformUser[]>(
    identityApiBaseUrl,
    buildApiPath('/api/users', { search }),
  );

  return response.data ?? [];
};

export const listRoles = async () => {
  const response = await authenticatedApiRequest<RoleOption[]>(identityApiBaseUrl, '/api/users/roles');

  return response.data ?? [];
};

export const createUser = async (request: CreateUserRequest) => {
  const response = await authenticatedApiRequest<PlatformUser>(identityApiBaseUrl, '/api/users', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response.data;
};

export const updateUserRoles = async (id: string, roles: UserRole[]) => {
  const response = await authenticatedApiRequest<PlatformUser>(identityApiBaseUrl, `/api/users/${id}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roles }),
  });

  return response.data;
};
