import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  Activity,
  Edit,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { User } from "../../../types/user";
import { listCompensationRequests } from "../../../services/compensationRequests/compensationRequestsApi";
import type { CompensationRequest } from "../../../services/compensationRequests/compensationRequestTypes";
import { getErrorMessage } from "../../../utils/errors";
import { toast } from "sonner";
import { useLanguage } from "../../../providers/LanguageContext";

interface UserProfileProps {
  user: User;
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<CompensationRequest[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const teacherUserId = user.role === "teacher" ? user.id : undefined;
        setRequests(await listCompensationRequests(undefined, teacherUserId));
      } catch (error) {
        toast.error(getErrorMessage(error, t("profile.toast_load_error")));
      }
    };

    void loadProfileData();
  }, [user.id, user.role]);

  const stats = useMemo(() => {
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(
      (request) => request.status === "Approved",
    ).length;
    const pendingRequests = requests.filter(
      (request) => request.status === "Pending",
    ).length;
    const rejectedRequests = requests.filter(
      (request) => request.status === "Rejected",
    ).length;
    const approvedPercent = totalRequests
      ? Math.round((approvedRequests / totalRequests) * 100)
      : 0;

    return {
      totalRequests,
      approvedRequests,
      pendingRequests,
      rejectedRequests,
      approvedPercent,
    };
  }, [requests]);

  const activityData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = days.map((name) => ({ name: t(`day.${name}`), requests: 0 }));

    requests.forEach((request) => {
      const date = new Date(request.submittedAt);
      if (!Number.isNaN(date.getTime())) {
        counts[date.getDay()].requests += 1;
      }
    });

    return counts.slice(1).concat(counts[0]);
  }, [requests, t]);

  const recentActivity = useMemo(
    () =>
      requests
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5)
        .map((request) => ({
          id: request.id,
          type:
            request.status === "Approved"
              ? "approval"
              : request.status === "Rejected"
                ? "rejection"
                : "request",
          title: t("profile.status_request").replace(
            "{status}",
            t(`requests.${request.status.toLowerCase()}`),
          ),
          date: new Date(request.updatedAt).toLocaleDateString(
            language === "pt" ? "pt-PT" : "en-US",
          ),
          desc: `${request.curricularUnit} - ${request.course}`,
        })),
    [requests, language, t],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("profile.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {t("profile.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" /> {t("profile.edit_profile")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Profile Card - Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <div className="absolute -bottom-12 left-6">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-lg">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-slate-900 text-xl font-bold">
                    {user.name
                      .split("")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-14 pb-6 px-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user.name}
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 capitalize">
                  <Briefcase className="w-3 h-3" /> {t(`role.${user.role}`)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> {t("profile.department")}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user.email || "user@compensa.edu"}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  +1 (555) 000-0000
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {t("profile.campus")}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {t("profile.joined").replace("{date}", "Jan 2024")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {t("profile.performance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t("profile.total_requests")}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalRequests}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t("profile.approved")}
                  </span>
                  <span className="font-bold text-green-600">
                    {stats.approvedRequests}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${stats.approvedPercent}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <Card className="border-none shadow-md ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  {t("profile.weekly_activity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar
                        dataKey="requests"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-none shadow-md ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="w-4 h-4 text-amber-500" />
                  {t("profile.badges")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg text-amber-600">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {t("profile.early_adopter")}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {t("profile.early_adopter_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity timeline */}
          <Card className="border-none shadow-md ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {t("profile.recent_activity")}
              </CardTitle>
              <CardDescription>
                {t("profile.recent_activity_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-8 py-2">
                {recentActivity.map((item, index) => (
                  <div key={item.id} className="relative pl-8">
                    <span
                      className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        item.type === "approval"
                          ? "bg-green-500"
                          : item.type === "request"
                            ? "bg-blue-500"
                            : item.type === "rejection"
                              ? "bg-red-500"
                              : item.type === "achievement"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                      }`}
                    ></span>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
