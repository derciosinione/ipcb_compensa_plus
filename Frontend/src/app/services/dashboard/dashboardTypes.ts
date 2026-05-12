export interface DashboardMetric {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeCourses: number;
  activeClassrooms: number;
  activeClassGroups: number;
  classCoveragePercent: number;
}

export interface DashboardTrendPoint {
  period: string;
  total: number;
  approved: number;
  rejected: number;
}

export interface DashboardScheduleEvent {
  id: string;
  title: string;
  time: string;
  room: string;
  course: string;
  classGroup: string;
  type: string;
}

export interface DashboardWeekDay {
  dayOfWeek: number;
  date: string;
  events: DashboardScheduleEvent[];
}

export interface DashboardSummary {
  activeAcademicYear?: string | null;
  metrics: DashboardMetric;
  trends: DashboardTrendPoint[];
  weekSchedule: DashboardWeekDay[];
}
