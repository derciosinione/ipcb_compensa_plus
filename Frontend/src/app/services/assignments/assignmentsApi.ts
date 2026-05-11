import { authenticatedApiRequest, coreApiBaseUrl } from '../api/httpClient';
import type { CourseAssignmentInput, UserAcademicAssignments } from './assignmentTypes';

export const listUserUnitAssignments = async (userId: string) => {
  const response = await authenticatedApiRequest<UserAcademicAssignments>(
    coreApiBaseUrl,
    `/api/users/${encodeURIComponent(userId)}/unit-assignments`,
  );

  return response.data ?? { courses: [], units: [] };
};

export const saveUserUnitAssignments = async (
  userId: string,
  userEmail: string,
  curricularUnitIds: string[],
  courses: CourseAssignmentInput[] = [],
) => {
  const response = await authenticatedApiRequest<UserAcademicAssignments>(
    coreApiBaseUrl,
    `/api/users/${encodeURIComponent(userId)}/unit-assignments`,
    {
      method: 'PUT',
      body: JSON.stringify({ userEmail, courses, curricularUnitIds }),
    },
  );

  return response.data ?? { courses: [], units: [] };
};
