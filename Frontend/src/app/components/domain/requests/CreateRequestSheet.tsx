import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../ui/utils";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useLanguage } from "../../../providers/LanguageContext";
import { listClassrooms } from "../../../services/classrooms/classroomsApi";
import type { Classroom } from "../../../services/classrooms/classroomTypes";
import {
  getCourseDetails,
  listCourses,
} from "../../../services/courses/coursesApi";
import type {
  ClassGroup,
  ClassSchedule,
  Course,
  CurricularUnit,
} from "../../../services/courses/courseTypes";
import { checkScheduleAvailability } from "../../../services/schedules/schedulesApi";

interface CreateRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  onCreate: (data: any) => void;
}

export const CreateRequestSheet = ({
  open,
  onOpenChange,
  initialDate,
  initialTime,
  onCreate,
}: CreateRequestSheetProps) => {
  const { t } = useLanguage();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<CurricularUnit[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [roomAvailability, setRoomAvailability] = useState<
    Record<string, boolean | undefined>
  >({});
  const [formData, setFormData] = useState({
    courseId: "",
    unit: "",
    classGroupId: "",
    originalClassScheduleId: "",
    date: "",
    startTime: "",
    endTime: "",
    room: "",
    reason: "",
    type: "theoretical",
  });

  useEffect(() => {
    if (!open) return;

    const loadClassrooms = async () => {
      const [loadedClassrooms, loadedCourses] = await Promise.all([
        listClassrooms(),
        listCourses(),
      ]);
      setClassrooms(loadedClassrooms.filter((room) => room.isActive));
      setCourses(loadedCourses.filter((course) => course.isActive));
    };

    void loadClassrooms();
  }, [open]);

  useEffect(() => {
    if (!formData.courseId) {
      setUnits([]);
      setClassGroups([]);
      setSchedules([]);
      return;
    }

    const loadCourseDetails = async () => {
      const details = await getCourseDetails(formData.courseId);
      setUnits((details?.units ?? []).filter((unit) => unit.isActive));
      setClassGroups(
        (details?.classes ?? []).filter((classGroup) => classGroup.isActive),
      );
      setSchedules(
        (details?.schedules ?? []).filter((schedule) => schedule.isActive),
      );
    };

    void loadCourseDetails();
  }, [formData.courseId]);

  useEffect(() => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setRoomAvailability({});
      return;
    }

    const selectedSchedule = schedules.find(
      (schedule) => schedule.id === formData.originalClassScheduleId,
    );
    if (!selectedSchedule) {
      setRoomAvailability({});
      return;
    }

    const loadAvailability = async () => {
      const entries = await Promise.all(
        classrooms.map(async (room) => {
          const availability = await checkScheduleAvailability({
            academicYearId: selectedSchedule.academicYearId,
            semester: selectedSchedule.semester,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            classGroupId: formData.classGroupId || undefined,
            classroomId: room.id,
            excludedScheduleId: selectedSchedule.id,
          });

          return [room.id, availability?.isAvailable] as const;
        }),
      );

      setRoomAvailability(Object.fromEntries(entries));
    };

    void loadAvailability();
  }, [
    classrooms,
    formData.classGroupId,
    formData.date,
    formData.endTime,
    formData.originalClassScheduleId,
    formData.startTime,
    schedules,
  ]);

  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({
        ...prev,
        date: initialDate.toISOString().split("T")[0],
      }));
    }
    if (initialTime) {
      setFormData((prev) => ({
        ...prev,
        startTime: initialTime,
        endTime: calculateEndTime(initialTime),
      }));
    }
  }, [initialDate, initialTime, open]);

  const calculateEndTime = (start: string) => {
    if (!start) return "";
    const [h, m] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m);
    date.setHours(date.getHours() + 2); // Default 2h duration
    return date.toTimeString().slice(0, 5);
  };

  const handleSubmit = () => {
    onCreate(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      courseId: "",
      unit: "",
      classGroupId: "",
      originalClassScheduleId: "",
      date: "",
      startTime: "",
      endTime: "",
      room: "",
      reason: "",
      type: "theoretical",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{t("sheet.new_compensation")}</SheetTitle>
          <SheetDescription>{t("sheet.description")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Course, unit & type */}
          <div className="space-y-2">
            <Label>{t("form.course")}</Label>
            <Select
              value={formData.courseId}
              onValueChange={(courseId) =>
                setFormData({
                  ...formData,
                  courseId,
                  unit: "",
                  classGroupId: "",
                  originalClassScheduleId: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.select_course")} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">{t("sheet.unit_course")}</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    unit: v,
                    classGroupId: "",
                    originalClassScheduleId: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("sheet.select_unit")} />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t("form.component")}</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.select_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theoretical">Theoretical</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("form.class_group")}</Label>
              <Select
                value={formData.classGroupId}
                onValueChange={(classGroupId) =>
                  setFormData({
                    ...formData,
                    classGroupId,
                    originalClassScheduleId: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.select_group")} />
                </SelectTrigger>
                <SelectContent>
                  {classGroups
                    .filter(
                      (group) =>
                        !formData.unit ||
                        group.curricularUnitId === formData.unit,
                    )
                    .map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("form.original_schedule")}</Label>
              <Select
                value={formData.originalClassScheduleId}
                onValueChange={(originalClassScheduleId) =>
                  setFormData({ ...formData, originalClassScheduleId })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Original schedule" />
                </SelectTrigger>
                <SelectContent>
                  {schedules
                    .filter(
                      (schedule) =>
                        !formData.classGroupId ||
                        schedule.classGroupId === formData.classGroupId,
                    )
                    .map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {formatSchedule(schedule)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label>{t("sheet.date_time")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="date"
                  className="pl-9"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="relative w-24">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="time"
                  className="pl-8"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center text-slate-400">-</div>
              <div className="relative w-24">
                <Input
                  type="time"
                  className="text-center"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <Label>{t("sheet.proposed_room")}</Label>
            <Select
              value={formData.room}
              onValueChange={(v) => setFormData({ ...formData, room: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("sheet.select_room")} />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <span className="flex items-center justify-between w-full gap-2">
                      <span>
                        {room.name}{" "}
                        <span className="text-slate-400 text-xs">
                          ({room.type})
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full",
                          roomAvailability[room.id] === false
                            ? "text-red-600 bg-red-50"
                            : "text-green-600 bg-green-50",
                        )}
                      >
                        {roomAvailability[room.id] === false
                          ? t("sheet.busy")
                          : t("sheet.avail")}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {t("sheet.checking_availability").replace(
                "{date}",
                formData.date || "selected date",
              )}
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t("details.justification")}</Label>
            <Textarea
              id="reason"
              placeholder={t("form.reason_placeholder")}
              className="resize-none min-h-[100px]"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("sheet.create_request")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatSchedule = (schedule: ClassSchedule) => {
  return `${dayNames[schedule.dayOfWeek] ?? `Day ${schedule.dayOfWeek}`} ${schedule.startTime}-${schedule.endTime}`;
};
