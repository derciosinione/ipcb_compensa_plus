import {
  authenticatedApiRequest,
  buildApiPath,
  coreApiBaseUrl,
} from "../api/httpClient";
import type { GlobalSearchResult } from "./searchTypes";

export const searchPlatform = async (query: string) => {
  const response = await authenticatedApiRequest<GlobalSearchResult[]>(
    coreApiBaseUrl,
    buildApiPath("/api/search", { query }),
  );

  return response.data ?? [];
};
