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

export interface ClassroomAvailabilityItem {
  classroomId: string;
  classroomName: string;
  isAvailable: boolean;
  conflictInfo: string | null;
}

export interface RoomsAvailabilityQuery {
  academicYearId: string;
  semester: number;
  date: string;
  startTime: string;
  endTime: string;
  excludedScheduleId?: string;
}

export const checkRoomsAvailability = async (
  query: RoomsAvailabilityQuery,
): Promise<ClassroomAvailabilityItem[]> => {
  const response = await authenticatedApiRequest<ClassroomAvailabilityItem[]>(
    coreApiBaseUrl,
    buildApiPath("/api/schedules/rooms-availability", query),
  );

  return response.data ?? [];
};

export interface ClassGroupBusySlot {
  startTime: string;
  endTime: string;
  type: string;
}

export interface ClassGroupDayResult {
  busySlots: ClassGroupBusySlot[];
  freeWindows: string[];
}

export interface ClassGroupDayQuery {
  academicYearId: string;
  semester: number;
  date: string;
  classGroupIds: string;
  excludedScheduleId?: string;
  teacherUserId?: string;
}

export const checkClassGroupDay = async (
  query: ClassGroupDayQuery,
): Promise<ClassGroupDayResult> => {
  const response = await authenticatedApiRequest<ClassGroupDayResult>(
    coreApiBaseUrl,
    buildApiPath("/api/schedules/class-group-day", query),
  );

  return response.data ?? { busySlots: [], freeWindows: [] };
};
