import { authenticatedApiRequest, buildApiPath, coreApiBaseUrl } from '../api/httpClient';
import type {
  Course,
  CourseDetails,
  ClassGroup,
  ClassSchedule,
  CurricularUnit,
  CurricularUnitComponent,
  UpsertClassGroupRequest,
  UpsertClassScheduleRequest,
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

export const createClassGroup = async (courseId: string, request: UpsertClassGroupRequest) => {
  const response = await authenticatedApiRequest<ClassGroup>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/classes`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateClassGroup = async (
  courseId: string,
  classGroupId: string,
  request: UpsertClassGroupRequest,
) => {
  const response = await authenticatedApiRequest<ClassGroup>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/classes/${classGroupId}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const deleteClassGroup = async (courseId: string, classGroupId: string) => {
  await authenticatedApiRequest<void>(coreApiBaseUrl, `/api/courses/${courseId}/classes/${classGroupId}`, {
    method: 'DELETE',
  });
};

export const createClassSchedule = async (
  courseId: string,
  classGroupId: string,
  request: UpsertClassScheduleRequest,
) => {
  const response = await authenticatedApiRequest<ClassSchedule>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/classes/${classGroupId}/schedules`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateClassSchedule = async (
  courseId: string,
  classGroupId: string,
  scheduleId: string,
  request: UpsertClassScheduleRequest,
) => {
  const response = await authenticatedApiRequest<ClassSchedule>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/classes/${classGroupId}/schedules/${scheduleId}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const deleteClassSchedule = async (
  courseId: string,
  classGroupId: string,
  scheduleId: string,
) => {
  await authenticatedApiRequest<void>(
    coreApiBaseUrl,
    `/api/courses/${courseId}/classes/${classGroupId}/schedules/${scheduleId}`,
    {
      method: 'DELETE',
    },
  );
};
