import {
  authenticatedApiRequest,
  buildApiPath,
  coreApiBaseUrl,
} from "../api/httpClient";
import type {
  CompensationRequest,
  CompensationRequestStatus,
  CreateCompensationRequestRequest,
  UpdateCompensationRequestRequest,
} from "./compensationRequestTypes";

export const listCompensationRequests = async (
  status?: CompensationRequestStatus,
  teacherUserId?: string,
  academicYearId?: string,
) => {
  const response = await authenticatedApiRequest<CompensationRequest[]>(
    coreApiBaseUrl,
    buildApiPath("/api/compensation-requests", { status, teacherUserId, academicYearId }),
  );

  return response.data ?? [];
};

export const createCompensationRequest = async (
  request: CreateCompensationRequestRequest,
) => {
  const response = await authenticatedApiRequest<CompensationRequest>(
    coreApiBaseUrl,
    "/api/compensation-requests",
    {
      method: "POST",
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
      method: "PATCH",
      body: JSON.stringify({ status, decisionComment }),
    },
  );

  return response.data;
};

export const updateCompensationRequest = async (
  id: string,
  request: UpdateCompensationRequestRequest,
) => {
  const response = await authenticatedApiRequest<CompensationRequest>(
    coreApiBaseUrl,
    `/api/compensation-requests/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
  );

  return response.data;
};
export const uploadCompensationRequestDocument = async (
  requestId: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authenticatedApiRequest<any>(
    coreApiBaseUrl,
    `/api/compensation-requests/${requestId}/documents`,
    {
      method: "POST",
      body: formData,
    },
  );

  return response.data;
};

export const deleteCompensationRequestDocument = async (
  requestId: string,
  documentId: string,
) => {
  await authenticatedApiRequest(
    coreApiBaseUrl,
    `/api/compensation-requests/${requestId}/documents/${documentId}`,
    {
      method: "DELETE",
    },
  );
};

export const getDocumentDownloadUrl = (requestId: string, documentId: string) => {
  return `${coreApiBaseUrl}/api/compensation-requests/${requestId}/documents/${documentId}`;
};

export const deleteCompensationRequest = async (id: string) => {
  await authenticatedApiRequest(
    coreApiBaseUrl,
    `/api/compensation-requests/${id}`,
    {
      method: "DELETE",
    },
  );
};
