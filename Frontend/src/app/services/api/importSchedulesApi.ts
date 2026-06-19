import { authenticatedApiRequest, coreApiBaseUrl } from "./httpClient";

export interface TimetableImportPreviewResponse {
  academicYearId: string;
  academicYearName: string;
  detectedSemester: number;
  courses: CoursePreviewDto[];
  availableCourses: CourseLookupDto[];
  availableClassrooms: ClassroomLookupDto[];
  availableClassGroups: ClassGroupLookupDto[];
}

export interface ClassGroupLookupDto {
  id: string;
  courseId: string;
  name: string;
}


export interface CoursePreviewDto {
  tempId: string;
  name: string;
  abbreviation: string;
  isMatched: boolean;
  matchedCourseId: string | null;
  classes: ClassGroupPreviewDto[];
  availableUnits: CurricularUnitLookupDto[];
}

export interface ClassGroupPreviewDto {
  tempId: string;
  name: string;
  year: number;
  isMatched: boolean;
  matchedClassGroupId: string | null;
  schedules: SchedulePreviewDto[];
}

export interface SchedulePreviewDto {
  curricularUnitName: string;
  curricularUnitAbbreviation: string;
  isCurricularUnitMatched: boolean;
  matchedCurricularUnitId: string | null;
  componentType: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroomName: string;
  isClassroomMatched: boolean;
  matchedClassroomId: string | null;
}

export interface CourseLookupDto {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ClassroomLookupDto {
  id: string;
  name: string;
}

export interface CurricularUnitLookupDto {
  id: string;
  name: string;
  year: number;
  semester: number;
}

export interface TimetableImportConfirmRequest {
  academicYearId: string;
  semester: number;
  schedules: TimetableImportScheduleItem[];
  overwriteExisting: boolean;
  coursesToCreate?: CourseCreateDto[];
  classGroupsToCreate?: ClassGroupCreateDto[];
  curricularUnitsToCreate?: CurricularUnitCreateDto[];
  curricularUnitsToUpdate?: CurricularUnitCreateDto[];
  classroomsToCreate?: ClassroomCreateDto[];
}

export interface CourseCreateDto {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ClassroomCreateDto {
  id: string;
  name: string;
}

export interface ClassGroupCreateDto {
  id: string;
  courseId: string;
  name: string;
  year: number;
}

export interface CurricularUnitCreateDto {
  id: string;
  courseId: string;
  name: string;
  abbreviation: string;
  year: number;
  semester: number;
}

export interface TimetableImportScheduleItem {
  courseId: string;
  classGroupId: string;
  curricularUnitId: string;
  classroomId: string | null;
  componentType: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const importSchedulesApi = {
  previewImport: (formData: FormData) =>
    authenticatedApiRequest<TimetableImportPreviewResponse>(
      coreApiBaseUrl,
      "/api/schedules/import/preview",
      {
        method: "POST",
        body: formData,
      },
    ),

  confirmImport: (request: TimetableImportConfirmRequest) =>
    authenticatedApiRequest<number>(
      coreApiBaseUrl,
      "/api/schedules/import/confirm",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    ),
};
