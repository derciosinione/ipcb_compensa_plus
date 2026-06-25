import type { UserRole } from "./user";

export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ComponentType = "theoretical" | "practical" | "all";

export interface Comment {
  id: string;
  authorName: string;
  role: UserRole;
  text: string;
  createdAt: string;
}

export interface RequestDocument {
  id: string;
  requestId: string;
  fileName: string;
  sizeInBytes: number;
  contentType: string;
  createdAt: string;
}

export interface ClassRequest {
  id: string;
  course: string;
  unit: string;
  yearGroups: string[];
  componentType: ComponentType;
  originalDate: string;
  originalTime: string;
  originalRoom: string;
  newDate: string;
  newTime: string;
  newRoom: string;
  reason: string;
  status: RequestStatus;
  teacherName: string;
  submittedAt: string;
  hasConflict?: boolean;
  rejectionReason?: string;
  comments: Comment[];
  documents: RequestDocument[];

  // Internal ID fields for API mapping and updates
  courseId?: string | null;
  curricularUnitId?: string | null;
  classGroupId?: string | null;
  originalClassScheduleId?: string | null;
  originalClassroomId?: string | null;
  newClassroomId?: string | null;
}
