import { authenticatedApiRequest, coreApiBaseUrl } from '../api/httpClient';
import type { DashboardSummary } from './dashboardTypes';

export const getDashboardSummary = async () => {
  const response = await authenticatedApiRequest<DashboardSummary>(
    coreApiBaseUrl,
    '/api/dashboard/summary',
  );

  return response.data;
};
