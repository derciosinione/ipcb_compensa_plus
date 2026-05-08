import { apiRequest, coreApiBaseUrl } from '../api/httpClient';
import { getStoredAccessToken } from '../auth/authSession';
import type { Classroom, UpsertClassroomRequest } from './classroomTypes';

const getAccessToken = () => {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    throw new Error('You need to sign in again.');
  }

  return accessToken;
};

export const listClassrooms = async (search?: string) => {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const response = await apiRequest<Classroom[]>(
    coreApiBaseUrl,
    `/api/classrooms${params.size ? `?${params.toString()}` : ''}`,
    { accessToken: getAccessToken() },
  );

  return response.data ?? [];
};

export const createClassroom = async (request: UpsertClassroomRequest) => {
  const response = await apiRequest<Classroom>(coreApiBaseUrl, '/api/classrooms', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(request),
  });

  return response.data;
};

export const updateClassroom = async (id: string, request: UpsertClassroomRequest) => {
  const response = await apiRequest<Classroom>(coreApiBaseUrl, `/api/classrooms/${id}`, {
    method: 'PUT',
    accessToken: getAccessToken(),
    body: JSON.stringify(request),
  });

  return response.data;
};

export const deleteClassroom = async (id: string) => {
  await apiRequest<void>(coreApiBaseUrl, `/api/classrooms/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  });
};
