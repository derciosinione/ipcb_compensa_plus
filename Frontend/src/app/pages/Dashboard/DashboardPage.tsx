import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import { Badge } from "../../components/ui/badge";
import { format, addDays, startOfWeek } from "date-fns";
import { CompensationChart } from "./components/CompensationChart";
import { StatCard } from "../../components/common/StatCard";
import { useLanguage } from "../../providers/LanguageContext";
import { useNotificationsQuery } from "../../services/notifications/notificationQueries";
import { useDashboardSummaryQuery } from "../../services/dashboard/dashboardQueries";
import { useAcademicYear } from "../../providers/AcademicYearContext";
import type { DashboardWeekDay } from "../../services/dashboard/dashboardTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const EventCard = ({
  title,
  time,
  room,
  type,
  isCompact = false,
}: {
  title: string;
  time: string;
  room?: string;
  type: "class" | "blocked" | "holiday";
  isCompact?: boolean;
}) => {
  const variants = {
    class: "bg-white border-l-4 border-l-blue-500 shadow-xs dark:bg-slate-800",
    blocked:
      "bg-slate-50 border-l-4 border-l-slate-400 opacity-70 dark:bg-slate-800/50 dark:border-l-slate-600",
    holiday:
      "bg-red-50 border-l-4 border-l-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-l-red-500",
  };

  return (
    <div
      className={cn(
        "p-3 rounded-r-xl rounded-l-md border border-slate-100 dark:border-slate-700/50 mb-2.5 transition-all hover:scale-[1.02] hover:shadow-xs cursor-default",
        variants[type],
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">
            {title}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {time}
          </p>
        </div>
        {room && (
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0 shrink-0",
              isCompact
                ? "h-4.5 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:border-slate-700"
                : "h-5 bg-white dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
            )}
          >
            {room}
          </Badge>
        )}
      </div>
    </div>
  );
};

const SeeMoreCard = ({ count, onClick }: { count: number; onClick: () => void }) => {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="w-full p-2.5 rounded-xl border border-dashed border-blue-200 dark:border-blue-800/80 bg-blue-50/20 hover:bg-blue-50/50 dark:bg-blue-950/5 dark:hover:bg-blue-950/15 text-blue-600 dark:text-blue-400 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] hover:shadow-xs"
    >
      <span>{t("dashboard.more_classes").replace("{count}", String(count))}</span>
      <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
    </button>
  );
};

const WeeklyCalendar = ({
  weekSchedule = [],
}: {
  weekSchedule?: DashboardWeekDay[];
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const scheduleByDate = new Map(weekSchedule.map((day) => [day.date, day]));
  const today = format(new Date(), "yyyy-MM-dd");

  // State for schedule filters
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterClassGroup, setFilterClassGroup] = useState("all");
  const [filterRoom, setFilterRoom] = useState("all");

  // Collect unique filter options from all events in the week
  const allEvents = weekSchedule.flatMap((day) => day.events);
  const uniqueCourses = Array.from(
    new Set(allEvents.map((e) => e.course).filter(Boolean))
  ).sort();
  const uniqueClassGroups = Array.from(
    new Set(allEvents.map((e) => e.classGroup).filter(Boolean))
  ).sort();
  const uniqueRooms = Array.from(
    new Set(allEvents.map((e) => e.room).filter(Boolean))
  ).sort();

  const days = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(start, i);
    const dateKey = format(date, "yyyy-MM-dd");
    const schedule = scheduleByDate.get(dateKey);
    let events = schedule?.events ?? [];

    // Apply filters
    if (filterCourse !== "all") {
      events = events.filter((e) => e.course === filterCourse);
    }
    if (filterClassGroup !== "all") {
      events = events.filter((e) => e.classGroup === filterClassGroup);
    }
    if (filterRoom !== "all") {
      events = events.filter((e) => e.room === filterRoom);
    }

    return {
      name: format(date, "EEE"),
      date: format(date, "d"),
      active: dateKey === today,
      events,
    };
  });

  return (
    <Card className="col-span-1 lg:col-span-2 border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100/50 dark:border-slate-800">
        <div>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            {t("dashboard.this_week_schedule")}
          </CardTitle>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {format(start, "MMMM d")} -{" "}
            {format(addDays(start, 4), "MMMM d, yyyy")}
          </p>
        </div>

        {/* Dynamic Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {uniqueCourses.length > 0 && (
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="h-8.5 w-[140px] text-xs bg-slate-50 dark:bg-slate-800 border-none shadow-none font-medium">
                <SelectValue placeholder={t("dashboard.all_courses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.all_courses")}</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {uniqueClassGroups.length > 0 && (
            <Select value={filterClassGroup} onValueChange={setFilterClassGroup}>
              <SelectTrigger className="h-8.5 w-[140px] text-xs bg-slate-50 dark:bg-slate-800 border-none shadow-none font-medium">
                <SelectValue placeholder={t("dashboard.all_classes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.all_classes")}</SelectItem>
                {uniqueClassGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {uniqueRooms.length > 0 && (
            <Select value={filterRoom} onValueChange={setFilterRoom}>
              <SelectTrigger className="h-8.5 w-[110px] text-xs bg-slate-50 dark:bg-slate-800 border-none shadow-none font-medium">
                <SelectValue placeholder={t("dashboard.all_rooms")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.all_rooms")}</SelectItem>
                {uniqueRooms.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {(filterCourse !== "all" || filterClassGroup !== "all" || filterRoom !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterCourse("all");
                setFilterClassGroup("all");
                setFilterRoom("all");
              }}
              className="h-8.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-2"
            >
              {t("dashboard.reset")}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/calendar")}
            className="h-8.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span>{t("dashboard.full_calendar")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((day) => (
          <div
            key={day.name}
            className={cn(
              "flex flex-col gap-3 rounded-2xl p-3 transition-colors",
              day.active
                ? "bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-900"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
            )}
          >
            <div className="flex items-center lg:block lg:text-center mb-2 gap-3 lg:gap-0">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0 lg:mb-1 w-8 lg:w-auto">
                {t(`day.${day.name}`)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm transition-all",
                  day.active
                    ? "bg-blue-600 text-white shadow-blue-300 dark:shadow-none"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                )}
              >
                {day.date}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              {/* Show at most 3 events, and if there are more, show SeeMoreCard */}
              {day.events.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  time={event.time}
                  room={event.room}
                  type="class"
                  isCompact
                />
              ))}
              {day.events.length > 3 && (
                <SeeMoreCard
                  count={day.events.length - 3}
                  onClick={() => navigate("/calendar")}
                />
              )}
              {day.events.length === 0 && (
                <div className="h-16 rounded-lg border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">
                    {t("dashboard.no_classes")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const QuickActions = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: allNotifications = [], isLoading } = useNotificationsQuery();
  const notifications = allNotifications.slice(0, 3);

  return (
    <Card className="h-full border-none shadow-md bg-slate-900 dark:bg-black text-white relative overflow-hidden ring-1 ring-slate-900 dark:ring-slate-800">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          {t("dashboard.notifications")}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {t("dashboard.requiring_attention")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {isLoading ? (
          <div className="text-center text-sm text-slate-400 py-4">
            {t("dashboard.loading")}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-4">
            {t("dashboard.no_notifications")}
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => navigate("/notifications")}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {notification.isRead ? t("dashboard.notif_read") : t("dashboard.notif_new")}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-semibold text-sm mb-1 group-hover:text-blue-200 transition-colors">
                {notification.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {notification.message}
              </p>
            </div>
          ))
        )}

        <Button
          className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none mt-4"
          onClick={() => navigate("/notifications")}
        >
          {t("dashboard.view_all")}
        </Button>
      </CardContent>
    </Card>
  );
};

export const DashboardPage = () => {
  const { t } = useLanguage();
  const { selectedYear } = useAcademicYear();
  const { data: summary, isLoading } = useDashboardSummaryQuery(selectedYear?.id);
  const metrics = summary?.metrics;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("dashboard.total_requests")}
          value={isLoading ? "..." : (metrics?.totalRequests ?? 0)}
          icon={FileText}
          trend={summary?.activeAcademicYear ?? undefined}
          trendUp={Boolean(summary?.activeAcademicYear)}
          iconColor="text-blue-600"
          className="bg-white"
        />
        <StatCard
          title={t("dashboard.pending")}
          value={isLoading ? "..." : (metrics?.pendingRequests ?? 0)}
          icon={Clock}
          iconColor="text-amber-600"
          className="bg-white"
        />
        <StatCard
          title={t("dashboard.compensated")}
          value={isLoading ? "..." : (metrics?.approvedRequests ?? 0)}
          icon={CheckCircle2}
          trend={t("dashboard.target_met")}
          trendUp={true}
          iconColor="text-green-600"
          className="bg-white"
        />
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-md ring-1 ring-indigo-500/50">
          <CardContent className="p-6 flex flex-col justify-center h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <MoreVertical className="w-6 h-6 text-white" />
            </div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
              {t("dashboard.quick_stat")}
            </p>
            <div className="text-2xl font-bold mb-1">
              {isLoading ? "..." : `${metrics?.classCoveragePercent ?? 0}%`}
            </div>
            <p className="text-xs text-indigo-100/80">
              {t("dashboard.class_coverage")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CompensationChart data={summary?.trends ?? []} isLoading={isLoading} />
        <div className="lg:col-span-1 h-full">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <WeeklyCalendar weekSchedule={summary?.weekSchedule} />
      </div>
    </div>
  );
};
