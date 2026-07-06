export type ComponentType = "theoretical" | "practical" | "all";

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  unit: string;
  curricularUnitId: string;
  type: "theoretical" | "practical";
  room: string;
  course: string;
  yearGroup: string;
  classGroup: string;
}

export interface Room {
  id: string;
  name: string;
  type: "Amphitheater" | "Standard" | "PC Lab" | "Mac Lab";
  capacity: number;
  features: string[];
}

export interface Course {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  type: "Licenciatura" | "Mestrado" | "CTeSP";
  durationYears: number;
  totalCredits: number;
  coordinatorId: string;
  image: string;
}

export interface CurricularUnit {
  id: string;
  name: string;
  abbreviation: string;
  courseId: string;
  year: number;
  semester: 1 | 2;
  ects: number;
  teacherIds: string[];
  regentId?: string;
  theoreticalTeacherId?: string;
  practicalTeacherId?: string;
  component: "Theoretical" | "Practical" | "All";
}

export interface ClassGroup {
  id: string;
  name: string;
  year: number;
  teacherId: string;
  academicYearId: string;
}
