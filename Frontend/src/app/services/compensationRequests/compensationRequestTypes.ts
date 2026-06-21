export type TeachingComponentType = "Theoretical" | "Practical" | "All";
export type CompensationRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface CreateCompensationRequestRequest {
  teacherUserId: string;
  teacherName: string;
  academicYearId: string;
  courseId: string;
  curricularUnitId: string;
  classGroupId: string;
  originalClassScheduleId: string;
  newClassroomId: string;
  originalDate: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  justification: string;
}

export interface UpdateCompensationRequestRequest {
  newClassroomId: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  justification: string;
}

export interface CompensationRequestDocument {
  id: string;
  compensationRequestId: string;
  fileName: string;
  sizeInBytes: number;
  contentType: string;
  createdAt: string;
}

export interface CompensationRequest {
  id: string;
  teacherUserId: string;
  teacherName: string;
  academicYearId?: string | null;
  semester: number;
  courseId?: string | null;
  curricularUnitId?: string | null;
  classGroupId?: string | null;
  originalClassScheduleId?: string | null;
  originalClassroomId?: string | null;
  newClassroomId?: string | null;
  course: string;
  curricularUnit: string;
  yearGroups: string[];
  componentType: TeachingComponentType;
  originalDate: string;
  originalStartTime: string;
  originalEndTime: string;
  originalRoom: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  newRoom: string;
  justification: string;
  status: CompensationRequestStatus;
  decisionComment?: string | null;
  hasConflict: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  documents: CompensationRequestDocument[];
  comments?: CompensationRequestComment[];
}

export interface CompensationRequestComment {
  id: string;
  compensationRequestId: string;
  authorUserId: string;
  authorName: string;
  role: string;
  text: string;
  createdAt: string;
}
