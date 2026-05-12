import { useQuery } from '@tanstack/react-query';
import { searchPlatform } from './searchApi';

export const searchQueryKeys = {
  all: ['search'] as const,
  results: (query: string) => [...searchQueryKeys.all, query.trim()] as const,
};

export const useGlobalSearchQuery = (query: string) =>
  useQuery({
    queryKey: searchQueryKeys.results(query),
    queryFn: () => searchPlatform(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
