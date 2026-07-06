export const appPaths = {
  root: "/",
  login: "/login",
  authVerify: "/auth/verify",
  dashboard: "/dashboard",
  requests: "/requests",
  requestDetails: "/requests/:id",
  calendar: "/calendar",
  notifications: "/notifications",
  courses: "/courses",
  courseDetails: "/courses/:id",
  classDetails: "/courses/:courseId/classes/:classId",
  classrooms: "/classrooms",
  users: "/users",
  systemCalendar: "/system-calendar",
  aiAssistant: "/ai-assistant",
  profile: "/profile",
  settings: "/settings",
  preferences: "/preferences",
  academicYears: "/academic-years",
  importSchedules: "/schedules/import",
} as const;

export type AppPath = (typeof appPaths)[keyof typeof appPaths];

const searchTargetPaths: Record<string, AppPath> = {
  courses: appPaths.courses,
  class: appPaths.courses,
  classes: appPaths.courses,
  requests: appPaths.requests,
  request: appPaths.requests,
  classrooms: appPaths.classrooms,
  room: appPaths.classrooms,
  rooms: appPaths.classrooms,
};

export const resolveAppPath = (target: string): AppPath => {
  if (target.startsWith("/")) {
    return target as AppPath;
  }

  return searchTargetPaths[target] ?? appPaths.dashboard;
};
