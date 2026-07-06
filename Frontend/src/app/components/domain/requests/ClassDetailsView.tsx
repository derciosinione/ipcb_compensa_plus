import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  User,
  Upload,
  Layers,
  Inbox
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ClassGroup, CurricularUnit, TimeSlot, Course as ViewCourse } from "../../../types/academic";
import { AddScheduleModal } from "../../../pages/Courses/components/AddScheduleModal";
import { BulkImportSchedulesSheet } from "../../../pages/Courses/components/BulkImportSchedulesSheet";
import { toast } from "sonner";
import type { PlatformUser } from "../../../services/users/userTypes";
import type { Classroom } from "../../../services/classrooms/classroomTypes";
import { useLanguage } from "../../../providers/LanguageContext";

interface ClassDetailsViewProps {
  course?: ViewCourse | null;
  classGroup: ClassGroup;
  unit?: CurricularUnit;
  teacher?: PlatformUser;
  schedules: TimeSlot[];
  allClasses: ClassGroup[];
  courseUnits: CurricularUnit[];
  classrooms: Classroom[];
  onBack: () => void;
  onAddSchedule: (data: Omit<TimeSlot, "id">) => void | Promise<void>;
  onUpdateSchedule: (
    id: string,
    data: Omit<TimeSlot, "id">,
  ) => void | Promise<void>;
  onDeleteSchedule: (id: string) => void | Promise<void>;
  userRole: "coordinator" | "teacher" | "admin";
}

export const ClassDetailsView = ({
  course,
  classGroup,
  unit,
  teacher,
  schedules,
  allClasses,
  courseUnits,
  classrooms,
  onBack,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  userRole,
}: ClassDetailsViewProps) => {
  const { t } = useLanguage();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TimeSlot | undefined>(undefined);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const canManage = userRole === "coordinator" || userRole === "admin";
  const teacherName = teacher?.fullName || teacher?.email || "";
  const courseName = course?.abbreviation || course?.name || (classGroup.courseId || "").toUpperCase();

  const handleEditClick = (schedule: TimeSlot) => {
    setEditingSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingSchedule(undefined);
    setIsScheduleModalOpen(true);
  };

  const handleBulkImport = (newSchedules: Omit<TimeSlot, "id">[]) => {
    const schedulesWithContext = newSchedules.map((schedule) => ({
      ...schedule,
      classGroup: classGroup.name,
      unit: schedule.unit || "General",
      course: classGroup.courseId,
    }));

    schedulesWithContext.forEach((schedule) => {
      onAddSchedule(schedule);
    });

    toast.success(
      t("class_details.toast_import_success")
        .replace("{count}", String(newSchedules.length))
        .replace("{name}", classGroup.name),
    );
  };

  const handleSaveSchedule = (data: Omit<TimeSlot, "id">) => {
    if (editingSchedule) {
      onUpdateSchedule(editingSchedule.id, data);
    } else {
      onAddSchedule(data);
    }
    setIsScheduleModalOpen(false);
  };

  const getDayName = (day: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const key = days[day];
    return key ? t(`day.${key}`) : t("class_details.unknown");
  };

  // Only consider schedules actually mapped to this classGroup
  const classSchedules = schedules.filter((s) => s.classGroup === classGroup.name);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <AddScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        classGroup={classGroup}
        unit={unit || courseUnits[0]}
        courseUnits={courseUnits}
        existingTimetable={schedules}
        allClasses={allClasses}
        initialData={editingSchedule}
        classrooms={classrooms}
      />

      <BulkImportSchedulesSheet
        open={isBulkImportOpen}
        onOpenChange={isBulkImportOpen ? () => setIsBulkImportOpen(false) : () => setIsBulkImportOpen(true)}
        onImport={handleBulkImport}
        courseName={courseName}
      />

      {/* Header Navigation */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="pl-0 gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-100 rounded-full px-4 h-9 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t("class_details.back_to_course")}
        </Button>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {t("class_details.title")}
        </span>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-none border-0">
                {courseName}
              </Badge>
              <Badge variant="outline" className="text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700 font-medium">
                <Layers className="w-3 h-3 mr-1" /> {t("courses.year_label").replace("{year}", String(classGroup.year))}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {classGroup.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t("class_details.description")}
            </p>
          </div>

          {/* Teacher Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 min-w-[280px] w-full md:w-auto">
            {teacher ? (
              <>
                <Avatar className="w-12 h-12 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=random`} />
                  <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold">{teacherName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {t("class_details.assigned_teacher")}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate" title={teacherName}>
                    {teacherName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={teacher.email}>{teacher.email}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 text-slate-500 py-1 w-full">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("class_details.no_teacher")}</p>
                  <p className="text-xs mt-0.5 text-slate-500">{t("class_details.requires_assignment")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-800/50">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t("class_details.weekly_schedule")}
              </h2>
              <p className="text-slate-500 text-sm mt-1">{t("class_details.schedule_description")}</p>
            </div>
          </div>
          
          {canManage && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsBulkImportOpen(true)}
                className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex-1 sm:flex-auto"
              >
                <Upload className="w-4 h-4" /> {t("class_details.bulk_import")}
              </Button>
              <Button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 flex-1 sm:flex-auto"
              >
                <Plus className="w-4 h-4 mr-2" /> {t("class_details.add_slot")}
              </Button>
            </div>
          )}
        </div>

        {classSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
              <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
              {t("class_details.no_schedules")}
            </h3>
            <p className="text-slate-500 text-center max-w-md mb-8">
              {t("class_details.no_schedules_desc")}
            </p>
            {canManage && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsBulkImportOpen(true)}
                  className="gap-2 border-slate-300 dark:border-slate-700 shadow-sm"
                  size="lg"
                >
                  <Upload className="w-4 h-4" /> {t("class_details.bulk_import_timetable")}
                </Button>
                <Button
                  onClick={handleAddClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" /> {t("class_details.add_first_slot")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {classSchedules
              .sort(
                (a, b) =>
                  a.dayOfWeek - b.dayOfWeek ||
                  parseInt(a.startTime || "0") - parseInt(b.startTime || "0"),
              )
              .map((slot) => {
                const isPractical = slot.type === "practical";
                return (
                  <Card
                    key={slot.id}
                    className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-blue-300 dark:hover:ring-blue-700/50 hover:-translate-y-1 rounded-2xl"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${isPractical ? "bg-blue-500 group-hover:bg-blue-400" : "bg-purple-500 group-hover:bg-purple-400"}`} />
                    <CardHeader className="pl-6 pb-2 pt-5">
                      <div className="flex justify-between items-start mb-3">
                        <Badge 
                           variant="outline" 
                           className={`uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                             isPractical 
                               ? "text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" 
                               : "text-purple-600 border-purple-200 bg-purple-50/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                           }`}
                        >
                          {t(`component.${slot.type}`)}
                        </Badge>
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                              <DropdownMenuLabel className="text-xs uppercase text-slate-400">{t("coordinator.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(slot)}
                                className="cursor-pointer font-medium text-slate-700 dark:text-slate-300 my-0.5"
                              >
                                <Edit className="w-4 h-4 mr-2 text-slate-400" /> {t("class_details.edit_schedule")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer font-medium my-0.5"
                                onClick={() => onDeleteSchedule(slot.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> {t("class_details.delete_schedule")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1 mb-1" title={slot.unit}>
                        {slot.unit}
                      </CardTitle>
                      <CardDescription className="font-semibold text-slate-500 dark:text-slate-400">
                        {getDayName(slot.dayOfWeek)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-6 pt-3 pb-5">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="font-semibold text-sm">
                            {slot.startTime || "TBD"} <span className="text-slate-400 font-normal mx-1">{t("class_details.time_to")}</span> {slot.endTime || "TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                            <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="font-medium text-sm line-clamp-1">{slot.room || t("class_details.no_room")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

