import { authenticatedApiRequest, coreApiBaseUrl } from "../api/httpClient";
import type { AcademicYear } from "./academicYearTypes";

export const listAcademicYears = async () => {
  const response = await authenticatedApiRequest<AcademicYear[]>(
    coreApiBaseUrl,
    "/api/academic-years",
  );

  return response.data ?? [];
};

export const getActiveAcademicYear = async () => {
  const response = await authenticatedApiRequest<AcademicYear>(
    coreApiBaseUrl,
    "/api/academic-years/active",
  );

  return response.data;
};

export const createAcademicYear = async (request: any) => {
  const response = await authenticatedApiRequest<AcademicYear>(
    coreApiBaseUrl,
    "/api/academic-years",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateAcademicYear = async (id: string, request: any) => {
  const response = await authenticatedApiRequest<AcademicYear>(
    coreApiBaseUrl,
    `/api/academic-years/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const copyOfferings = async (toYearId: string, fromYearId: string) => {
  await authenticatedApiRequest(
    coreApiBaseUrl,
    `/api/academic-years/${toYearId}/copy-offerings/${fromYearId}`,
    {
      method: "POST",
    },
  );
};
