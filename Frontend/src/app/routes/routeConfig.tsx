import React from "react";
import {
  AiConverterPage,
  CalendarPage,
  ClassroomsPage,
  CoursesPage,
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
  allowedRoles?: UserRole[];
}

const adminOnly: UserRole[] = ["admin"];
const staffRoles: UserRole[] = ["teacher", "coordinator", "admin"];

export const getProtectedRouteDefinitions = (
  user: AuthenticatedUser,
): AppRouteDefinition[] => [
  { path: appPaths.dashboard, element: <DashboardPage /> },
  {
    path: appPaths.requests,
    element: <RequestsPage userRole={user.role} user={user} />,
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.calendar,
    element: <CalendarPage userRole={user.role} user={user} />,
    allowedRoles: staffRoles,
  },
  { path: appPaths.notifications, element: <NotificationsPage /> },
  {
    path: appPaths.courses,
    element: <CoursesPage user={user} />,
    allowedRoles: staffRoles,
  },
  {
    path: appPaths.classrooms,
    element: <ClassroomsPage user={user} />,
    allowedRoles: staffRoles,
  },
  { path: appPaths.users, element: <UsersPage />, allowedRoles: adminOnly },
  {
    path: appPaths.systemCalendar,
    element: <SystemCalendarPage />,
    allowedRoles: adminOnly,
  },
  {
    path: appPaths.aiConverter,
    element: <AiConverterPage />,
    allowedRoles: staffRoles,
  },
  { path: appPaths.profile, element: <ProfilePage user={user} /> },
  {
    path: appPaths.settings,
    element: <SettingsPage />,
    allowedRoles: adminOnly,
  },
  { path: appPaths.preferences, element: <PreferencesPage /> },
];
