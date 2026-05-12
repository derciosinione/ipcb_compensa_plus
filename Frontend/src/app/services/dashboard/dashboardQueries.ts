import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from './dashboardApi';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardQueryKeys.all, 'summary'] as const,
};

export const useDashboardSummaryQuery = () =>
  useQuery({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: getDashboardSummary,
    staleTime: 60_000,
  });
