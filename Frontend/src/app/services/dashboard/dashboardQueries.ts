import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "./dashboardApi";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: (academicYearId?: string) => [...dashboardQueryKeys.all, "summary", academicYearId] as const,
};

export const useDashboardSummaryQuery = (academicYearId?: string) =>
  useQuery({
    queryKey: dashboardQueryKeys.summary(academicYearId),
    queryFn: () => getDashboardSummary(academicYearId),
    staleTime: 60_000,
  });
