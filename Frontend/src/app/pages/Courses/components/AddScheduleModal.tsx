import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { toast } from "sonner";
import { TimeSlot, ClassGroup, CurricularUnit } from "../../../types/academic";
import type { Classroom } from "../../../services/classrooms/classroomTypes";
import { useLanguage } from "../../../providers/LanguageContext";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: Omit<TimeSlot, "id">) => void | Promise<void>;
  classGroup: ClassGroup;
  unit: CurricularUnit;
  existingTimetable: TimeSlot[];
  allClasses: ClassGroup[];
  initialData?: TimeSlot;
  courseUnits: CurricularUnit[]; // Pass available units
  classrooms: Classroom[];
}

export const AddScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  classGroup,
  unit: initialUnit, // Rename prop to avoid confusion
  existingTimetable,
  allClasses,
  initialData,
  courseUnits,
  classrooms,
}: AddScheduleModalProps) => {
  const { t } = useLanguage();
  const [dayOfWeek, setDayOfWeek] = useState<string>("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [room, setRoom] = useState<string>("");
  const [componentType, setComponentType] = useState<
    "theoretical" | "practical"
  >("theoretical");
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnit.id);
  const [selectedSemester, setSelectedSemester] = useState<string>(
    initialUnit.semester.toString(),
  );

  // Derive current unit object from selection
  const selectedUnit =
    courseUnits?.find((u) => u.id === selectedUnitId) || initialUnit;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDayOfWeek(initialData.dayOfWeek.toString());
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setRoom(initialData.room);
        setComponentType(initialData.type);

        // Try to match unit name to ID
        const matchedUnit = courseUnits?.find(
          (u) => u.name === initialData.unit,
        );
        if (matchedUnit) {
          setSelectedUnitId(matchedUnit.id);
          setSelectedSemester(matchedUnit.semester.toString());
        } else {
          setSelectedUnitId(initialUnit.id);
          setSelectedSemester(initialUnit.semester.toString());
        }
      } else {
        setDayOfWeek("1");
        setStartTime("09:00");
        setEndTime("11:00");
        setRoom("");
        setComponentType("theoretical");
        setSelectedUnitId(initialUnit.id);
        setSelectedSemester(initialUnit.semester.toString());
      }
    }
  }, [isOpen, initialData, initialUnit, courseUnits]);

  // Update semester when unit changes
  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const newUnit = courseUnits?.find((u) => u.id === unitId);
    if (newUnit) {
      setSelectedSemester(newUnit.semester.toString());
    }
  };

  const validateSchedule = () => {
    const start = parseInt(startTime.replace(":", ""));
    const end = parseInt(endTime.replace(":", ""));

    if (start >= end) {
      toast.error(t("schedule_modal.toast_time_error"));
      return false;
    }

    const dayInt = parseInt(dayOfWeek);

    // Calculate duration
    const startH = parseInt(startTime.split(":")[0]);
    const startM = parseInt(startTime.split(":")[1]);
    const endH = parseInt(endTime.split(":")[0]);
    const endM = parseInt(endTime.split(":")[1]);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);

    // Filter slots for this class group on this day (exclude current slot if editing)
    // Check against selectedUnit, not initialUnit
    const groupSlots = existingTimetable.filter(
      (t) =>
        t.classGroup === classGroup.name &&
        t.unit === selectedUnit.name &&
        t.dayOfWeek === dayInt &&
        (initialData ? t.id !== initialData.id : true),
    );

    let currentDailyMinutes = 0;
    groupSlots.forEach((slot) => {
      const sH = parseInt(slot.startTime.split(":")[0]);
      const sM = parseInt(slot.startTime.split(":")[1]);
      const eH = parseInt(slot.endTime.split(":")[0]);
      const eM = parseInt(slot.endTime.split(":")[1]);
      currentDailyMinutes += eH * 60 + eM - (sH * 60 + sM);
    });

    if (currentDailyMinutes + totalMinutes > 8 * 60) {
      toast.error(
        t("schedule_modal.toast_limit_exceeded")
          .replace("{count}", (currentDailyMinutes / 60).toFixed(1))
          .replace("{unit}", selectedUnit.name),
      );
      return false;
    }

    // Overlap Checks
    // Check Room overlap
    const roomConflict = existingTimetable.find(
      (slot) =>
        slot.dayOfWeek === dayInt &&
        slot.room === room &&
        (initialData ? slot.id !== initialData.id : true) &&
        isOverlapping(slot.startTime, slot.endTime, startTime, endTime),
    );

    if (roomConflict) {
      toast.error(t("schedule_modal.toast_room_occupied").replace("{room}", room));
      return false;
    }

    // Teacher Conflict
    // Use teacher from class group (assuming teacher is same for class group regardless of unit?
    // Actually ClassGroup is unit-specific in data model, so if we change unit, we might imply different teacher?
    // But we are scheduling for THIS class group (which has a teacherId).
    const currentTeacherId = classGroup.teacherId;
    const teacherClasses = allClasses.filter(
      (c) => c.teacherId === currentTeacherId,
    );

    for (const tClass of teacherClasses) {
      const slotsForTeacherClass = existingTimetable.filter(
        (s) =>
          s.classGroup === tClass.name &&
          s.dayOfWeek === dayInt &&
          (initialData ? s.id !== initialData.id : true) &&
          isOverlapping(s.startTime, s.endTime, startTime, endTime),
      );

      if (slotsForTeacherClass.length > 0) {
        const conflictSlot = slotsForTeacherClass[0];
        toast.error(
          t("schedule_modal.toast_teacher_conflict")
            .replace("{unit}", conflictSlot.unit)
            .replace("{classGroup}", conflictSlot.classGroup)
            .replace("{time}", conflictSlot.startTime),
        );
        return false;
      }
    }

    return true;
  };

  const isOverlapping = (
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ) => {
    return start1 < end2 && start2 < end1;
  };

  const handleSave = async () => {
    if (!room) {
      toast.error(t("schedule_modal.toast_select_classroom_error"));
      return;
    }
    if (validateSchedule()) {
      await onSave({
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        unit: selectedUnit.name,
        curricularUnitId: selectedUnit.id,
        type: componentType,
        room,
        course: selectedUnit.courseId,
        yearGroup: `Year ${selectedUnit.year}`,
        classGroup: classGroup.name,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {classGroup.name}
            </Badge>
          </div>
          <DialogTitle>
            {initialData ? t("schedule_modal.title_edit") : t("schedule_modal.title_add")}
          </DialogTitle>
          <DialogDescription>
            {t("schedule_modal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              {t("form.select_unit")}
            </Label>
            <Select value={selectedUnitId} onValueChange={handleUnitChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("schedule_modal.select_unit")} />
              </SelectTrigger>
              <SelectContent>
                {(courseUnits || []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="component" className="text-right">
              {t("form.component")}
            </Label>
            <Select
              value={componentType}
              onValueChange={(v: any) => setComponentType(v)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theoretical">{t("component.theoretical")}</SelectItem>
                <SelectItem value="practical">{t("component.practical")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="semester" className="text-right">
              {t("uc_modal.semester_label")}
            </Label>
            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("courses.semester_label").replace("{semester}", "1")}</SelectItem>
                <SelectItem value="2">{t("courses.semester_label").replace("{semester}", "2")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day" className="text-right">
              {t("calendar.day")}
            </Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("schedule_modal.select_day")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("day.Monday")}</SelectItem>
                <SelectItem value="2">{t("day.Tuesday")}</SelectItem>
                <SelectItem value="3">{t("day.Wednesday")}</SelectItem>
                <SelectItem value="4">{t("day.Thursday")}</SelectItem>
                <SelectItem value="5">{t("day.Friday")}</SelectItem>
                <SelectItem value="6">{t("day.Saturday")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              {t("common.time")}
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room" className="text-right">
              {t("form.room")}
            </Label>
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("schedule_modal.select_classroom")} />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.type}, Cap: {r.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {initialData ? t("schedule_modal.btn_update") : t("schedule_modal.btn_add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
