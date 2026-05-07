import React from 'react';
import { User } from '../mocks/data';
import {
  AiConverterPage,
  CalendarPage,
  ClassroomsPage,
  CoursesPage,
  DashboardPage,
  NotificationsPage,
  PreferencesPage,
  ProfilePage,
  ProjectStoryboardPage,
  RequestsPage,
  SettingsPage,
  SystemCalendarPage,
  UsersPage,
} from '../pages';
import { AppPath, appPaths } from './paths';

export interface AppRouteDefinition {
  path: AppPath;
  element: React.ReactElement;
}

export const getProtectedRouteDefinitions = (user: User): AppRouteDefinition[] => [
  { path: appPaths.dashboard, element: <DashboardPage /> },
  { path: appPaths.requests, element: <RequestsPage userRole={user.role} /> },
  { path: appPaths.calendar, element: <CalendarPage userRole={user.role} /> },
  { path: appPaths.notifications, element: <NotificationsPage /> },
  { path: appPaths.courses, element: <CoursesPage user={user} /> },
  { path: appPaths.classrooms, element: <ClassroomsPage user={user} /> },
  { path: appPaths.users, element: <UsersPage /> },
  { path: appPaths.systemCalendar, element: <SystemCalendarPage /> },
  { path: appPaths.projectStoryboard, element: <ProjectStoryboardPage /> },
  { path: appPaths.aiConverter, element: <AiConverterPage /> },
  { path: appPaths.profile, element: <ProfilePage user={user} /> },
  { path: appPaths.settings, element: <SettingsPage /> },
  { path: appPaths.preferences, element: <PreferencesPage /> },
];
