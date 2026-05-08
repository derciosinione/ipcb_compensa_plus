import { apiRequest, coreApiBaseUrl } from '../api/httpClient';
import { getStoredAccessToken } from '../auth/authSession';
import type { Course, CourseDetails, UpsertCourseRequest } from './courseTypes';

const getAccessToken = () => {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    throw new Error('You need to sign in again.');
  }

  return accessToken;
};

export const listCourses = async (search?: string) => {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const response = await apiRequest<Course[]>(
    coreApiBaseUrl,
    `/api/courses${params.size ? `?${params.toString()}` : ''}`,
    { accessToken: getAccessToken() },
  );

  return response.data ?? [];
};

export const createCourse = async (request: UpsertCourseRequest) => {
  const response = await apiRequest<Course>(coreApiBaseUrl, '/api/courses', {
    method: 'POST',
    accessToken: getAccessToken(),
    body: JSON.stringify(request),
  });

  return response.data;
};

export const getCourseDetails = async (id: string) => {
  const response = await apiRequest<CourseDetails>(coreApiBaseUrl, `/api/courses/${id}/details`, {
    accessToken: getAccessToken(),
  });

  return response.data;
};

export const updateCourse = async (id: string, request: UpsertCourseRequest) => {
  const response = await apiRequest<Course>(coreApiBaseUrl, `/api/courses/${id}`, {
    method: 'PUT',
    accessToken: getAccessToken(),
    body: JSON.stringify(request),
  });

  return response.data;
};

export const deleteCourse = async (id: string) => {
  await apiRequest<void>(coreApiBaseUrl, `/api/courses/${id}`, {
    method: 'DELETE',
    accessToken: getAccessToken(),
  });
};
