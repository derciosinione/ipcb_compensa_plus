import {
  authenticatedApiRequest,
  buildApiPath,
  coreApiBaseUrl,
} from "../api/httpClient";
import type {
  ScheduleAvailability,
  ScheduleAvailabilityQuery,
} from "./scheduleTypes";

export const checkScheduleAvailability = async (
  query: ScheduleAvailabilityQuery,
) => {
  const response = await authenticatedApiRequest<ScheduleAvailability>(
    coreApiBaseUrl,
    buildApiPath("/api/schedules/availability", query),
  );

  return response.data;
};
