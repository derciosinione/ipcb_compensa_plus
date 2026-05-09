import { authenticatedApiRequest, buildApiPath, coreApiBaseUrl } from '../api/httpClient';
import type {
  Course,
  CourseDetails,
  CurricularUnit,
  CurricularUnitComponent,
  UpsertCourseRequest,
  UpsertCurricularUnitComponentRequest,
  UpsertCurricularUnitRequest,
} from './courseTypes';

export const listCourses = async (search?: string) => {
  const response = await authenticatedApiRequest<Course[]>(
    coreApiBaseUrl,
    buildApiPath('/api/courses', { search }),
  );

  return response.data ?? [];
};

export const createCourse = async (request: UpsertCourseRequest) => {
  const response = await authenticatedApiRequest<Course>(coreApiBaseUrl, '/api/courses', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response.data;
};

export const getCourseDetails = async (id: string) => {
  const response = await authenticatedApiRequest<CourseDetails>(coreApiBaseUrl, `/api/courses/${id}/details`);

  return response.data;
};

export const updateCourse = async (id: string, request: UpsertCourseRequest) => {
  const response = await authenticatedApiRequest<Course>(coreApiBaseUrl, `/api/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });

  return response.data;
};

export const deleteCourse = async (id: string) => {
  await authenticatedApiRequest<void>(coreApiBaseUrl, `/api/courses/${id}`, {
    method: 'DELETE',
  });
};

export const createCurricularUnit = async (courseId: string, request: UpsertCurricularUnitRequest) => {
  const response = await authenticatedApiRequest<CurricularUnit>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/units`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateCurricularUnit = async (
  courseId: string,
  unitId: string,
  request: UpsertCurricularUnitRequest,
) => {
  const response = await authenticatedApiRequest<CurricularUnit>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/units/${unitId}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const deleteCurricularUnit = async (courseId: string, unitId: string) => {
  await authenticatedApiRequest<void>(coreApiBaseUrl, `/api/courses/${courseId}/units/${unitId}`, {
    method: 'DELETE',
  });
};

export const createCurricularUnitComponent = async (
  courseId: string,
  unitId: string,
  request: UpsertCurricularUnitComponentRequest,
) => {
  const response = await authenticatedApiRequest<CurricularUnitComponent>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/units/${unitId}/components`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateCurricularUnitComponent = async (
  courseId: string,
  unitId: string,
  componentId: string,
  request: UpsertCurricularUnitComponentRequest,
) => {
  const response = await authenticatedApiRequest<CurricularUnitComponent>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/units/${unitId}/components/${componentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const deleteCurricularUnitComponent = async (
  courseId: string,
  unitId: string,
  componentId: string,
) => {
  await authenticatedApiRequest<void>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/units/${unitId}/components/${componentId}`,
    {
      method: 'DELETE',
    },
  );
};
