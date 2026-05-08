export type CourseDegreeType = 'Licenciatura' | 'Mestrado' | 'CTeSP';

export interface Course {
  id: string;
  name: string;
  abbreviation: string;
  type: CourseDegreeType;
  description: string;
  durationYears: number;
  totalCredits: number;
  coordinatorUserId?: string | null;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCourseRequest {
  name: string;
  abbreviation: string;
  type: CourseDegreeType;
  description: string;
  durationYears: number;
  totalCredits: number;
  coordinatorUserId?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

export type UnitComponentType = 'Theoretical' | 'Practical' | 'All';

export interface CurricularUnit {
  id: string;
  courseId: string;
  name: string;
  year: number;
  semester: 1 | 2;
  ects: number;
  teacherIds: string[];
  regentId?: string | null;
  theoreticalTeacherId?: string | null;
  practicalTeacherId?: string | null;
  component: UnitComponentType;
  isActive: boolean;
}

export interface ClassGroup {
  id: string;
  courseId: string;
  curricularUnitId: string;
  name: string;
  teacherId: string;
  isActive: boolean;
}

export interface CourseDetails {
  course: Course;
  units: CurricularUnit[];
  classes: ClassGroup[];
}
