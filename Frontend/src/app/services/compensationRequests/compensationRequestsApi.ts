import { authenticatedApiRequest, buildApiPath, coreApiBaseUrl } from '../api/httpClient';
import type {
  CompensationRequest,
  CompensationRequestStatus,
  CreateCompensationRequestRequest,
} from './compensationRequestTypes';

export const listCompensationRequests = async (
  status?: CompensationRequestStatus,
  teacherUserId?: string,
) => {
  const response = await authenticatedApiRequest<CompensationRequest[]>(
    coreApiBaseUrl,
    buildApiPath('/api/compensation-requests', { status, teacherUserId }),
  );

  return response.data ?? [];
};

export const createCompensationRequest = async (request: CreateCompensationRequestRequest) => {
  const response = await authenticatedApiRequest<CompensationRequest>(
    coreApiBaseUrl,
    '/api/compensation-requests',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateCompensationRequestStatus = async (
  id: string,
  status: CompensationRequestStatus,
  decisionComment?: string,
) => {
  const response = await authenticatedApiRequest<CompensationRequest>(
    coreApiBaseUrl,
    `/api/compensation-requests/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, decisionComment }),
    },
  );

  return response.data;
};
