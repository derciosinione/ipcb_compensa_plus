export interface UserUnitAssignment {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  curricularUnitId: string;
  isResponsible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseTeacherAssignment {
  id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  isCoordinator: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAcademicAssignments {
  courses: CourseTeacherAssignment[];
  units: UserUnitAssignment[];
}
