import {
  BookOpen,
  Calendar,
  CalendarDays,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { User } from "../types/user";
import { appPaths, AppPath } from "../routes/paths";

type Translate = (key: string) => string;

export interface NavigationItem {
  path: AppPath;
  icon: LucideIcon;
  label: string;
  badge?: string;
}

interface NavigationContext {
  t: Translate;
  user: User;
}

export const getMainNavigationItems = ({
  t,
  user,
}: NavigationContext): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      path: appPaths.dashboard,
      icon: LayoutDashboard,
      label: t("menu.dashboard"),
    },
    {
      path: appPaths.requests,
      icon: FileText,
      label: user.role === "teacher" ? t("menu.my_requests") : t("menu.requests"),
      badge: "3",
    },
    { path: appPaths.calendar, icon: CalendarDays, label: t("menu.calendar") },
    { path: appPaths.courses, icon: BookOpen, label: t("menu.courses") },
    { path: appPaths.classrooms, icon: MapPin, label: t("menu.classrooms") },
  ];

  if (user.role === "admin" || user.role === "coordinator") {
    items.push({
      path: appPaths.importSchedules,
      icon: Calendar,
      label: t("menu.import_schedules"),
    });
  }

  items.push({
    path: appPaths.aiAssistant,
    icon: Sparkles,
    label: t("menu.ai_converter") || "AI Assistant",
  });

  return items;
};

export const getAdminNavigationItems = ({
  t,
}: NavigationContext): NavigationItem[] => [
  { path: appPaths.users, icon: Users, label: t("menu.users") },
  { path: appPaths.academicYears, icon: Calendar, label: t("menu.academic_years") || "Academic Years" },
  { path: appPaths.systemCalendar, icon: Calendar, label: t("menu.holidays") },
  { path: appPaths.settings, icon: Settings, label: t("menu.settings") },
];
