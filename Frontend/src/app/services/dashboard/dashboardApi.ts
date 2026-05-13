import { authenticatedApiRequest, buildApiPath, coreApiBaseUrl } from "../api/httpClient";
import type { DashboardSummary } from "./dashboardTypes";

export const getDashboardSummary = async (academicYearId?: string) => {
  const response = await authenticatedApiRequest<DashboardSummary>(
    coreApiBaseUrl,
    buildApiPath("/api/dashboard/summary", { academicYearId }),
  );

  return response.data;
};
