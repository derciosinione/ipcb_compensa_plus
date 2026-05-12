import { authenticatedApiRequest, coreApiBaseUrl } from '../api/httpClient';
import type { AcademicYear } from './academicYearTypes';

export const listAcademicYears = async () => {
  const response = await authenticatedApiRequest<AcademicYear[]>(coreApiBaseUrl, '/api/academic-years');

  return response.data ?? [];
};

export const getActiveAcademicYear = async () => {
  const response = await authenticatedApiRequest<AcademicYear>(coreApiBaseUrl, '/api/academic-years/active');

  return response.data;
};
