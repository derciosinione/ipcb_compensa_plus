export interface ScheduleAvailabilityQuery {
  academicYearId: string;
  semester: number;
  date: string;
  startTime: string;
  endTime: string;
  classGroupId?: string;
  classroomId?: string;
  teacherUserId?: string;
  excludedScheduleId?: string;
  excludedRequestId?: string;
}

export interface ScheduleConflict {
  type: string;
  message: string;
  scheduleId?: string | null;
  compensationRequestId?: string | null;
}

export interface ScheduleAvailability {
  isAvailable: boolean;
  conflicts: ScheduleConflict[];
}
