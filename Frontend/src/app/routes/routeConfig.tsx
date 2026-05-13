import React from "react";
import {
  AcademicYearsPage,
  AiConverterPage,
  CalendarPage,
  ClassroomsPage,
  CoursesPage,
  CourseDetailsPage,
  DashboardPage,
  NotificationsPage,
  PreferencesPage,
  ProfilePage,
  RequestsPage,
  SettingsPage,
  SystemCalendarPage,
  UsersPage,
} from "../pages";
import type { AuthenticatedUser, UserRole } from "../types/user";
import { AppPath, appPaths } from "./paths";

export interface AppRouteDefinition {
  path: AppPath;
  element: React.ReactElement;
  title: string;
  allowedRoles?: UserRole[];
}

const adminOnly: UserRole[] = ["admin"];
const staffRoles: UserRole[] = ["teacher", "coordinator", "admin"];

export const getProtectedRouteDefinitions = (
  user: AuthenticatedUser,
): AppRouteDefinition[] => [
  {
    path: appPaths.dashboard,
    element: <DashboardPage />,
    title: "Dashboard",
  },
  {
    path: appPaths.requests,
    element: <RequestsPage userRole={user.role} user={user} />,
    title: "Requests Management",
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.calendar,
    element: <CalendarPage userRole={user.role} user={user} />,
    title: "Calendar",
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.notifications,
    element: <NotificationsPage />,
    title: "Notifications",
  },
  {
    path: appPaths.courses,
    element: <CoursesPage user={user} />,
    title: "Courses",
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.courseDetails,
    element: <CourseDetailsPage user={user} />,
    title: "Course Details",
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.classrooms,
    element: <ClassroomsPage user={user} />,
    title: "Classrooms",
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.users,
    element: <UsersPage />,
    title: "Users Management",
    allowedRoles: adminOnly,
  },
  {
    path: appPaths.systemCalendar,
    element: <SystemCalendarPage />,
    title: "System Calendar",
    allowedRoles: adminOnly,
  },
  {
    path: appPaths.aiConverter,
    element: <AiConverterPage />,
    title: "AI Converter",
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.profile,
    element: <ProfilePage user={user} />,
    title: "Profile",
  },
  {
    path: appPaths.settings,
    element: <SettingsPage />,
    title: "Settings",
    allowedRoles: adminOnly,
  },
  {
    path: appPaths.academicYears,
    element: <AcademicYearsPage />,
    title: "Academic Years",
    allowedRoles: adminOnly,
  },
  {
    path: appPaths.preferences,
    element: <PreferencesPage />,
    title: "Preferences",
  },
];
