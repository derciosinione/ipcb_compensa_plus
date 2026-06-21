import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import {
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../ui/utils";
import { Card, CardContent } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import { useLanguage } from "../../../providers/LanguageContext";
import {
  listCourses,
  getCourseDetails,
} from "../../../services/courses/coursesApi";
import type {
  Course,
  CourseDetails,
  ClassSchedule,
} from "../../../services/courses/courseTypes";
import { listClassrooms } from "../../../services/classrooms/classroomsApi";
import type { Classroom } from "../../../services/classrooms/classroomTypes";
import { getActiveAcademicYear } from "../../../services/academicYears/academicYearsApi";
import type { AcademicYear } from "../../../services/academicYears/academicYearTypes";
import { checkScheduleAvailability, checkRoomsAvailability, checkClassGroupDay } from "../../../services/schedules/schedulesApi";
import type { ClassroomAvailabilityItem, ClassGroupDayResult } from "../../../services/schedules/schedulesApi";

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any | any[]) => Promise<any> | any;
  initialData?: any; // If provided, enables"Edit Mode"
  user: AuthenticatedUser | null;
}

interface RequestFormData {
  id: string;
  course: string;
  courseName?: string;
  unit: string;
  unitName?: string;
  yearGroups: string[];
  yearGroupNames?: string[];
  componentType: string;
  originalDate: string;
  originalTime: string;
  originalRoom: string;
  newDate: string;
  newTime: string;
  newRoom: string;
  reason: string;
}

const initialFormState = {
  course: "",
  unit: "",
  yearGroups: [] as string[],
  componentType: "all",
  originalDate: "",
  originalTime: "",
  originalRoom: "",
  newDate: "",
  newTime: "",
  newRoom: "",
  reason: "",
};

export const RequestForm = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  user,
}: RequestFormProps) => {
  const [queue, setQueue] = useState<RequestFormData[]>([]);
  const [editingQueueItemId, setEditingQueueItemId] = useState<string | null>(null);
  const [currentData, setCurrentData] =
    useState<Omit<RequestFormData, "id">>(initialFormState);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null,
  );
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeAcademicYear, setActiveAcademicYear] =
    useState<AcademicYear | null>(null);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");
  const [originalDateError, setOriginalDateError] = useState("");
  const [roomAvailability, setRoomAvailability] = useState<ClassroomAvailabilityItem[]>([]);
  const [roomAvailabilityLoading, setRoomAvailabilityLoading] = useState(false);
  const [classGroupDayInfo, setClassGroupDayInfo] = useState<ClassGroupDayResult | null>(null);
  const [classGroupDayLoading, setClassGroupDayLoading] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [suggestedBaseDate, setSuggestedBaseDate] = useState<Date>(new Date());
  const [compBaseDate, setCompBaseDate] = useState<Date>(new Date());
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Edit Mode Flag
  const isEditMode = !!(initialData && initialData.id);

  useEffect(() => {
    if (!open) return;

    const loadFormContext = async () => {
      try {
        const [loadedCourses, loadedClassrooms, loadedAcademicYear] =
          await Promise.all([
            listCourses(),
            listClassrooms(),
            getActiveAcademicYear(),
          ]);

        setCourses(loadedCourses.filter((course) => course.isActive));
        setClassrooms(
          loadedClassrooms.filter((classroom) => classroom.isActive),
        );
        setActiveAcademicYear(loadedAcademicYear ?? null);
      } catch {
        toast.error("Unable to load academic data for the request form.");
      }
    };

    void loadFormContext();
  }, [open]);

  useEffect(() => {
    if (!currentData.course) {
      setCourseDetails(null);
      return;
    }

    const loadSelectedCourse = async () => {
      try {
        const details = await getCourseDetails(currentData.course);
        setCourseDetails(details ?? null);
      } catch {
        toast.error("Unable to load course details.");
      }
    };

    void loadSelectedCourse();
  }, [currentData.course]);

  useEffect(() => {
    setErrors({});
    if (initialData) {
      // Populate form if in edit mode
      setCurrentData({
        course: initialData.course || "",
        unit: initialData.unit || "",
        yearGroups: initialData.yearGroups || [],
        componentType: initialData.componentType || "all",
        originalDate: initialData.originalDate || "",
        originalTime: initialData.originalTime || "",
        originalRoom: initialData.originalRoom || "",
        newDate: initialData.newDate || "",
        newTime: initialData.newTime || "",
        newRoom: initialData.newRoom || "",
        reason: initialData.reason || "",
      });
      setQueue([]); // Clear queue in edit mode
    } else {
      // Reset if opening in create mode
      if (open) {
        setCurrentData(initialFormState);
        setQueue([]);
      }
    }
  }, [initialData, open]);

  const addDuration = (startTime: string, durationSource: string) => {
    const [sourceStart, sourceEnd] = durationSource
      .split("-")
      .map((value) => value.trim());
    const [sourceStartHour, sourceStartMinute] = sourceStart
      .split(":")
      .map(Number);
    const [sourceEndHour, sourceEndMinute] = sourceEnd.split(":").map(Number);
    const durationMinutes =
      sourceEndHour * 60 +
      sourceEndMinute -
      (sourceStartHour * 60 + sourceStartMinute);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const totalMinutes =
      startHour * 60 + startMinute + Math.max(durationMinutes, 60);
    const endHour = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const endMinute = (totalMinutes % 60).toString().padStart(2, "0");

    return `${endHour}:${endMinute}`;
  };

  const handleChange = (field: keyof typeof initialFormState, value: any) => {
    setErrors((prev) => ({ ...prev, [field]: false }));
    setCurrentData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "course") {
        next.unit = "";
        next.yearGroups = [];
        next.originalRoom = "";
        next.originalTime = "";
        next.originalDate = "";
      }

      if (field === "unit") {
        next.yearGroups = [];
        next.originalRoom = "";
        next.originalTime = "";
        next.originalDate = "";
      }

      return next;
    });

    // Validate originalDate weekday against selected schedule
    if (field === "originalDate" && value) {
      // Use the current selectedSchedule from closure (it's reactive)
      // We'll validate via a deferred check using the value directly
      setOriginalDateError(""); // Will be revalidated in useEffect
    }
  };

  const availableClasses =
    courseDetails?.classes.filter((group) => {
      if (!currentData.unit) return true;
      const unit = courseDetails.units.find((u) => u.id === currentData.unit);
      return !unit || group.year === unit.year;
    }) ?? [];
  const selectedClassGroupId = currentData.yearGroups[0];
  const availableSchedules = (courseDetails?.schedules ?? []).filter(
    (schedule) => {
      const scheduleTypeLower = schedule.componentType.toLowerCase();
      const selectedTypeLower = currentData.componentType.toLowerCase();
      const matchesComponent =
        selectedTypeLower === "all" ||
        scheduleTypeLower === selectedTypeLower ||
        (selectedTypeLower === "theoretical" &&
          (scheduleTypeLower === "theoretical" ||
            scheduleTypeLower === "theoreticalpractical")) ||
        (selectedTypeLower === "practical" &&
          (scheduleTypeLower === "practical" ||
            scheduleTypeLower === "practicallaboratorial"));

      return (
        schedule.classGroupId === selectedClassGroupId &&
        schedule.curricularUnitId === currentData.unit &&
        matchesComponent
      );
    }
  );
  const selectedSchedule = availableSchedules.find(
    (schedule) => schedule.id === currentData.originalRoom,
  );

  useEffect(() => {
    const canCheck =
      activeAcademicYear &&
      selectedSchedule &&
      selectedClassGroupId &&
      currentData.newDate &&
      currentData.newTime &&
      currentData.newRoom &&
      currentData.originalTime;

    if (!canCheck) {
      setConflictWarning(false);
      setConflictMessage("");
      return;
    }

    const checkAvailability = async () => {
      // 1. Check 8-hour limit locally first
      const newDateObj = new Date(currentData.newDate);
      const dayDetails = getDayDetails(newDateObj, selectedClassGroupId);
      const compensationDuration = calculateDurationHours(
        currentData.originalTime,
      );
      const totalProjectedHours = dayDetails.totalHours + compensationDuration;

      if (totalProjectedHours > 8) {
        setConflictWarning(true);
        setConflictMessage(
          `The class group already has ${Math.round(dayDetails.totalHours)} hours of classes on this day. Adding this compensation would total ${Math.round(totalProjectedHours)}h, exceeding the 8-hour daily limit.`,
        );
        return;
      }

      // 2. Then check for overlaps via API
      try {
        const availability = await checkScheduleAvailability({
          academicYearId: activeAcademicYear.id,
          semester: selectedSchedule.semester,
          date: currentData.newDate,
          startTime: currentData.newTime,
          endTime: addDuration(currentData.newTime, currentData.originalTime),
          classGroupId: selectedClassGroupId,
          classroomId: currentData.newRoom,
          excludedScheduleId: selectedSchedule.id,
        });

        const conflicts = availability?.conflicts ?? [];
        setConflictWarning(conflicts.length > 0);
        setConflictMessage(conflicts[0]?.message ?? "");
      } catch {
        setConflictWarning(false);
        setConflictMessage("");
      }
    };

    void checkAvailability();
  }, [
    activeAcademicYear,
    currentData.newDate,
    currentData.newRoom,
    currentData.newTime,
    currentData.originalTime,
    selectedClassGroupId,
    selectedSchedule,
  ]);

  // Auto-select original schedule if only one is available
  useEffect(() => {
    if (availableSchedules.length === 1 && !currentData.originalRoom) {
      const schedule = availableSchedules[0];
      setCurrentData((prev) => {
        let mappedComponentType = prev.componentType;
        const sType = schedule.componentType.toLowerCase();
        if (sType === "theoretical" || sType === "theoreticalpractical") {
          mappedComponentType = "theoretical";
        } else if (sType === "practical" || sType === "practicallaboratorial") {
          mappedComponentType = "practical";
        }
        return {
          ...prev,
          originalRoom: schedule.id,
          originalTime: `${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)}`,
          componentType: mappedComponentType,
          originalDate: "", // Reset date when schedule changes so user picks a valid one
        };
      });
      setOriginalDateError("");
      setSuggestedBaseDate(new Date());
    }
  }, [availableSchedules, currentData.originalRoom]);

  // Real-time weekday validation for originalDate
  useEffect(() => {
    if (!currentData.originalDate || !selectedSchedule) {
      setOriginalDateError("");
      return;
    }
    // Parse date as local (avoid UTC offset issues)
    const [year, month, day] = currentData.originalDate.split("-").map(Number);
    const pickedDate = new Date(year, month - 1, day);
    const pickedDow = pickedDate.getDay(); // 0=Sun, 1=Mon, ...
    if (pickedDow !== selectedSchedule.dayOfWeek) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      setOriginalDateError(
        `The selected date is a ${dayNames[pickedDow]}, but this class runs on ${dayNames[selectedSchedule.dayOfWeek]}s. Please pick a date that falls on a ${dayNames[selectedSchedule.dayOfWeek]}.`
      );
    } else {
      setOriginalDateError("");
    }
  }, [currentData.originalDate, selectedSchedule]);

  const getScheduleLabel = (schedule: ClassSchedule) => {
    const room = classrooms.find((item) => item.id === schedule.classroomId);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[schedule.dayOfWeek] ?? "Day"} ${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)} · ${room?.name ?? "Room"}`;
  };

  /** Returns only free windows that are wide enough to fit the compensation class duration */
  const getFilteredFreeWindows = (freeWindows: string[]): string[] => {
    const compensationDuration = currentData.originalTime
      ? calculateDurationHours(currentData.originalTime) * 60  // in minutes
      : 0;

    if (compensationDuration <= 0) return freeWindows;

    return freeWindows.filter((window) => {
      const parts = window.split("–");
      if (parts.length !== 2) return true;
      const [startStr, endStr] = parts;
      const [sh, sm] = startStr.split(":").map(Number);
      const [eh, em] = endStr.split(":").map(Number);
      const windowMinutes = (eh * 60 + em) - (sh * 60 + sm);
      return windowMinutes >= compensationDuration;
    });
  };

  const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && start2 < end1;
  };

  const getProposedEndTime = () => {
    if (!currentData.newTime || !currentData.originalTime) return "";
    return addDuration(currentData.newTime, currentData.originalTime);
  };

  const proposedEndTime = getProposedEndTime();
  const classGroupConflict = classGroupDayInfo?.busySlots?.find((slot) => {
    if (!currentData.newTime || !proposedEndTime) return false;
    return isTimeOverlapping(currentData.newTime, proposedEndTime, slot.startTime, slot.endTime);
  });

  // Fetch class group daily schedules and free windows when selected class group + date is set
  useEffect(() => {
    const canFetch =
      activeAcademicYear &&
      selectedClassGroupId &&
      selectedSchedule &&
      currentData.newDate;

    if (!canFetch) {
      setClassGroupDayInfo(null);
      return;
    }

    const fetchClassGroupDay = async () => {
      setClassGroupDayLoading(true);
      try {
        const result = await checkClassGroupDay({
          academicYearId: activeAcademicYear.id,
          semester: selectedSchedule.semester,
          date: currentData.newDate,
          classGroupIds: selectedClassGroupId,
          excludedScheduleId: selectedSchedule.id,
          teacherUserId: user?.id && user.id.trim() ? user.id : undefined,
        });
        setClassGroupDayInfo(result);
      } catch {
        setClassGroupDayInfo(null);
      } finally {
        setClassGroupDayLoading(false);
      }
    };

    void fetchClassGroupDay();
  }, [
    activeAcademicYear,
    selectedClassGroupId,
    selectedSchedule,
    currentData.newDate,
  ]);

  // Fetch room availability when new date + time + duration are fully set and no class group conflicts exist
  useEffect(() => {
    const canFetch =
      activeAcademicYear &&
      selectedSchedule &&
      currentData.newDate &&
      currentData.newTime &&
      currentData.originalTime &&
      !classGroupConflict;

    if (!canFetch) {
      setRoomAvailability([]);
      return;
    }

    const fetchRooms = async () => {
      setRoomAvailabilityLoading(true);
      try {
        const endTime = addDuration(currentData.newTime, currentData.originalTime);
        const items = await checkRoomsAvailability({
          academicYearId: activeAcademicYear.id,
          semester: selectedSchedule.semester,
          date: currentData.newDate,
          startTime: currentData.newTime,
          endTime,
          excludedScheduleId: selectedSchedule.id,
        });
        setRoomAvailability(items);
        // If currently selected room is now occupied, clear it
        if (currentData.newRoom) {
          const selected = items.find((r) => r.classroomId === currentData.newRoom);
          if (selected && !selected.isAvailable) {
            setCurrentData((prev) => ({ ...prev, newRoom: "" }));
          }
        }
      } catch {
        setRoomAvailability([]);
      } finally {
        setRoomAvailabilityLoading(false);
      }
    };

    void fetchRooms();
  }, [
    activeAcademicYear,
    currentData.newDate,
    currentData.newTime,
    currentData.originalTime,
    selectedSchedule,
    classGroupConflict,
  ]);


  const getSuggestedDates = (dayOfWeek: number, baseDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const base = new Date(baseDate);
    base.setHours(0, 0, 0, 0);

    // Start from the later of today or baseDate
    const startFrom = base > today ? base : today;

    // Find the first occurrence of the target weekday on or after startFrom
    let current = new Date(startFrom);
    while (current.getDay() !== dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }

    // Collect 6 upcoming occurrences (all on or after today)
    const dates: Date[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(current);
      d.setDate(d.getDate() + i * 7);
      dates.push(d);
    }

    return dates;
  };

  /** Format a local Date as YYYY-MM-DD without UTC conversion */
  const toLocalDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const calculateDurationHours = (timeRange: string) => {
    if (!timeRange.includes("-")) return 0;
    const [startStr, endStr] = timeRange.split("-");
    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);
    return (endH * 60 + endM - (startH * 60 + startM)) / 60;
  };

  const getDayDetails = (date: Date, classGroupId: string) => {
    const dayOfWeek = date.getDay();
    const daySchedules = (courseDetails?.schedules ?? []).filter(
      (s) => s.classGroupId === classGroupId && s.dayOfWeek === dayOfWeek,
    );

    let totalHours = 0;
    daySchedules.forEach((s) => {
      const start = s.startTime.split(":").map(Number);
      const end = s.endTime.split(":").map(Number);
      totalHours += (end[0] * 60 + end[1] - (start[0] * 60 + start[1])) / 60;
    });

    return {
      totalHours,
      schedules: daySchedules,
    };
  };

  const getCompensationSuggestions = (
    baseDate: Date,
    originalDate?: string,
    classGroupId?: string,
  ) => {
    const dates: { date: Date; hours: number; isConflict: boolean }[] = [];
    const base = new Date(baseDate);
    base.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = originalDate ? new Date(originalDate) : today;
    start.setHours(0, 0, 0, 0);

    if (base < start) {
      base.setTime(start.getTime());
    }

    let current = new Date(base);
    if (current <= today) {
      current.setDate(today.getDate() + 1);
    }

    const originalDuration = currentData.originalTime
      ? calculateDurationHours(currentData.originalTime)
      : 0;
    const originalDateObj = originalDate ? new Date(originalDate) : null;
    if (originalDateObj) originalDateObj.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7 && dates.length < 5; i++) {
      const dayDetails = classGroupId
        ? getDayDetails(current, classGroupId)
        : { totalHours: 0 };

      // If it's the same day of week as original, we subtract the original class hours (since it's being moved)
      // Actually, let's keep it simple: just show the current base load + the new class
      let projectedHours = dayDetails.totalHours;

      // If this suggestion is on the same DATE as the original class, it's probably not what they want, but let's allow it.
      // If it's the same day of week, we might want to subtract the original class if it's in the base schedule.

      dates.push({
        date: new Date(current),
        hours: projectedHours + originalDuration,
        isConflict: projectedHours + originalDuration > 8,
      });

      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {
      course: !currentData.course,
      unit: !currentData.unit,
      yearGroups: currentData.yearGroups.length === 0,
      reason: !currentData.reason.trim(),
      originalRoom: !currentData.originalRoom,
      originalDate: !currentData.originalDate,
      newDate: !currentData.newDate,
      newTime: !currentData.newTime,
      newRoom: !currentData.newRoom,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddToQueue = () => {
    if (!validateForm()) {
      toast.error(t("form.fill_required"));
      return;
    }

    if (originalDateError) {
      toast.error(originalDateError);
      return;
    }

    if (conflictWarning) {
      toast.error(
        conflictMessage ||
          "Resolve the schedule conflict before adding this request.",
      );
      return;
    }

    const courseObj = courses.find((c) => c.id === currentData.course);
    const unitObj = courseDetails?.units?.find(
      (u) => u.id === currentData.unit,
    );
    const groupNames = currentData.yearGroups.map((groupId) => {
      const g = courseDetails?.classes?.find((cg) => cg.id === groupId);
      return g ? g.name : groupId;
    });

    if (editingQueueItemId) {
      // Update the existing queue item
      setQueue((prev) =>
        prev.map((item) =>
          item.id === editingQueueItemId
            ? {
                ...currentData,
                id: editingQueueItemId,
                courseName: courseObj?.name ?? currentData.course,
                unitName: unitObj?.name ?? currentData.unit,
                yearGroupNames: groupNames,
              }
            : item,
        ),
      );
      setEditingQueueItemId(null);
      toast.success("Queue item updated.");
    } else {
      const newRequest: RequestFormData = {
        ...currentData,
        id: createLocalId(),
        courseName: courseObj?.name ?? currentData.course,
        unitName: unitObj?.name ?? currentData.unit,
        yearGroupNames: groupNames,
      };
      setQueue((prev) => [...prev, newRequest]);
      toast.success(t("form.added_queue"));
    }

    setCurrentData(initialFormState);
    setConflictWarning(false);
  };

  const handleEditQueueItem = (item: RequestFormData) => {
    setEditingQueueItemId(item.id);
    setCurrentData({
      course: item.course,
      unit: item.unit,
      yearGroups: item.yearGroups,
      componentType: item.componentType,
      originalDate: item.originalDate,
      originalTime: item.originalTime,
      originalRoom: item.originalRoom,
      newDate: item.newDate,
      newTime: item.newTime,
      newRoom: item.newRoom,
      reason: item.reason,
    });
    setConflictWarning(false);
    setOriginalDateError("");
  };

  const handleRemoveFromQueue = (id: string) => {
    if (editingQueueItemId === id) {
      setEditingQueueItemId(null);
      setCurrentData(initialFormState);
    }
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.id.trim()) {
      toast.error("Unable to identify the authenticated user. Please reload and try again.");
      return;
    }

    if (isEditMode) {
      if (originalDateError) {
        toast.error(originalDateError);
        return;
      }

      if (conflictWarning) {
        toast.error(
          conflictMessage ||
            "Resolve the schedule conflict before submitting this request.",
        );
        return;
      }

      if (!validateForm()) {
        toast.error(t("form.fill_required"));
        return;
      }

      try {
        // Submit single updated object
        await onSubmit({
          ...currentData,
          academicYearId: activeAcademicYear?.id,
          id: initialData.id,
        });
        onOpenChange(false);
        toast.success(t("form.updated_success"));
      } catch (error) {
        // Do NOT close the modal on error
      }
      return;
    }

    // Batch Mode
    if (!activeAcademicYear) {
      toast.error("Active academic year was not found.");
      return;
    }

    if (queue.length === 0 && (!currentData.course || !currentData.newDate)) {
      toast.error(t("form.no_submit"));
      return;
    }

    let finalQueue = [...queue];
    const isFormDirty = !!(
      currentData.course ||
      currentData.unit ||
      currentData.newDate ||
      currentData.newTime ||
      currentData.newRoom ||
      currentData.reason.trim()
    );

    if (isFormDirty) {
      if (!validateForm()) {
        toast.error(t("form.fill_required"));
        return;
      }

      if (originalDateError) {
        toast.error(originalDateError);
        return;
      }

      if (conflictWarning) {
        toast.error(
          conflictMessage ||
            "Resolve the schedule conflict before submitting this request.",
        );
        return;
      }

      finalQueue.push({ ...currentData, id: createLocalId() });
    }

    try {
      await onSubmit(
        finalQueue.map((item) => ({
          ...item,
          academicYearId: activeAcademicYear.id,
        })),
      );
      setQueue([]);
      setCurrentData(initialFormState);
      onOpenChange(false);
      toast.success(
        t("form.submitted_success").replace(
          "{count}",
          finalQueue.length.toString(),
        ),
      );
    } catch (error) {
      // Do NOT close the modal on error
    }
  };

  const createLocalId = () => crypto.randomUUID?.() ?? `local-${Date.now()}`;

  const clearForm = () => {
    setCurrentData(initialFormState);
    setConflictWarning(false);
    setOriginalDateError("");
    setErrors({});
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] w-full p-0 flex flex-col h-full bg-[#f8fafc] border-l border-slate-200 shadow-2xl">
        <SheetHeader className="px-6 py-6 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold text-slate-900">
                {isEditMode ? t("form.edit_title") : t("form.new_title")}
              </SheetTitle>
              <SheetDescription className="text-slate-500 mt-1">
                {isEditMode ? t("form.edit_desc") : t("form.new_desc")}
              </SheetDescription>
            </div>
            {!isEditMode && queue.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 px-3 py-1"
              >
                {t("form.pending_badge").replace(
                  "{count}",
                  queue.length.toString(),
                )}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-8">
            {/* Queue Section - ONLY show if NOT in Edit Mode */}
            {!isEditMode && queue.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {t("form.ready_submit").replace(
                    "{count}",
                    queue.length.toString(),
                  )}
                </h3>
                <div className="grid gap-3">
                  {queue.map((req) => (
                    <div
                      key={req.id}
                      className={cn(
                        "bg-white p-4 rounded-xl border shadow-sm relative group transition-colors",
                        editingQueueItemId === req.id
                          ? "border-blue-400 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-blue-200"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {req.unitName || req.unit}
                            </h4>
                            {req.componentType !== "all" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1 py-0 border-slate-300 text-slate-500 uppercase"
                              >
                                {req.componentType}
                              </Badge>
                            )}
                            {editingQueueItemId === req.id && (
                              <Badge className="text-[10px] h-4 px-1.5 py-0 bg-blue-100 text-blue-700 border-0">
                                Editing
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {req.courseName || req.course} •{" "}
                            <span className="font-medium text-slate-700">
                              {(req.yearGroupNames || req.yearGroups).join(
                                ", ",
                              )}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {editingQueueItemId !== req.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQueueItem(req)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                              title="Edit this item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromQueue(req.id)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="font-medium text-slate-700">
                            {req.originalDate}
                          </span>
                          <span className="text-slate-400">
                            {req.originalTime}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <span className="font-bold">{req.newDate}</span>
                          <span className="font-medium">{req.newTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  {isEditMode ? (
                    t("form.request_details")
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> {t("form.add_request")}
                    </>
                  )}
                </h3>
                {!isEditMode && queue.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearForm}
                    className="h-7 text-xs text-slate-500 hover:text-slate-700"
                  >
                    {t("form.clear_form")}
                  </Button>
                )}
              </div>

              <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-5 space-y-6">
                  {/* Context */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className={cn("text-xs font-semibold", (errors.course || errors.unit) ? "text-red-500" : "text-slate-500")}>
                        {t("form.course_unit")}
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={currentData.course}
                          onValueChange={(v) => handleChange("course", v)}
                        >
                          <SelectTrigger className={cn(
                            "flex-1 bg-white hover:border-slate-400 focus:border-slate-400 dark:bg-slate-950 h-10 transition-colors shadow-xs",
                            errors.course
                              ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 focus:border-red-500"
                              : "border-slate-300 dark:border-slate-700"
                          )}>
                            <SelectValue
                              placeholder={t("form.select_course")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={currentData.unit}
                          onValueChange={(v) => handleChange("unit", v)}
                        >
                          <SelectTrigger className={cn(
                            "flex-[1.5] bg-white hover:border-slate-400 focus:border-slate-400 dark:bg-slate-950 h-10 transition-colors shadow-xs",
                            errors.unit
                              ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 focus:border-red-500"
                              : "border-slate-300 dark:border-slate-700"
                          )}>
                            <SelectValue placeholder={t("form.select_unit")} />
                          </SelectTrigger>
                          <SelectContent>
                            {(courseDetails?.units ?? [])
                              .filter(
                                (unit) =>
                                  !user ||
                                  user.role !== "teacher" ||
                                  unit.teacherIds.includes(user.id) ||
                                  unit.responsibleTeacherId === user.id,
                              )
                              .map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {errors.course && (
                        <p className="text-[11px] text-red-500 font-medium">Course is required</p>
                      )}
                      {!errors.course && errors.unit && (
                        <p className="text-[11px] text-red-500 font-medium">Curricular Unit is required</p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex gap-4">
                        <div className="flex-[1.5] space-y-1.5">
                          <Label className={cn("text-xs font-semibold", errors.yearGroups ? "text-red-500" : "text-slate-500")}>
                            {t("form.groups")}
                          </Label>
                          <Popover
                            open={openCombobox}
                            onOpenChange={setOpenCombobox}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCombobox}
                                className={cn(
                                  "w-full justify-between h-10 bg-white hover:bg-white text-slate-700 dark:bg-slate-950 font-normal px-3 shadow-xs",
                                  errors.yearGroups
                                    ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 hover:border-red-500"
                                    : "border-slate-300 hover:border-slate-400 dark:border-slate-700"
                                )}
                              >
                                {currentData.yearGroups.length > 0
                                  ? `${currentData.yearGroups.length} selected`
                                  : t("form.select_groups")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Search group..." />
                                <CommandList>
                                  <CommandEmpty>No group found.</CommandEmpty>
                                  <CommandGroup>
                                    {availableClasses.map((group) => (
                                      <CommandItem
                                        key={group.id}
                                        value={group.name}
                                        onSelect={() =>
                                          setCurrentData((prev) => ({
                                            ...prev,
                                            yearGroups: [group.id],
                                            originalRoom: "",
                                            originalTime: "",
                                          }))
                                        }
                                      >
                                        <div
                                          className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            currentData.yearGroups.includes(
                                              group.id,
                                            )
                                              ? "bg-primary text-primary-foreground"
                                              : "opacity-50 [&_svg]:invisible",
                                          )}
                                        >
                                          <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{group.name}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {/* Selected Tags */}
                          {currentData.yearGroups.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {currentData.yearGroups.map((groupId) => {
                                const group = availableClasses.find(
                                  (item) => item.id === groupId,
                                );
                                return (
                                  <Badge
                                    key={groupId}
                                    variant="secondary"
                                    className="bg-slate-100 text-slate-600 border-slate-200 font-normal text-[10px] pl-2 pr-1 h-5 flex items-center gap-1"
                                  >
                                    {group?.name ?? groupId}
                                    <span
                                      className="cursor-pointer hover:bg-slate-200 rounded-full p-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentData((prev) => ({
                                          ...prev,
                                          yearGroups: [],
                                        }));
                                      }}
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </span>
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                          {errors.yearGroups && (
                            <p className="text-[11px] text-red-500 font-medium mt-1">At least one group/class is required</p>
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-500">
                            {t("form.component")}
                          </Label>
                          <Select
                            value={currentData.componentType}
                            onValueChange={(v) =>
                              handleChange("componentType", v)
                            }
                          >
                            <SelectTrigger className="bg-white border-slate-300 hover:border-slate-400 focus:border-slate-400 dark:bg-slate-950 dark:border-slate-700 h-10 transition-colors shadow-xs">
                              <SelectValue
                                placeholder={t("form.select_type")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {(!user || user.role !== "teacher") && (
                                <SelectItem value="all">
                                  All / Standard
                                </SelectItem>
                              )}
                              {(courseDetails?.components ?? [])
                                .filter(
                                  (comp) =>
                                    comp.curricularUnitId ===
                                      currentData.unit &&
                                    (!user ||
                                      user.role !== "teacher" ||
                                      comp.responsibleTeacherId === user.id),
                                )
                                .map((comp) => (
                                  <SelectItem
                                    key={comp.id}
                                    value={comp.type.toLowerCase()}
                                  >
                                    {comp.type}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className={cn("text-xs font-semibold", errors.reason ? "text-red-500" : "text-slate-500")}>
                        {t("requests.reason")}
                      </Label>
                      <Input
                        placeholder={t("form.reason_placeholder")}
                        className={cn(
                          "bg-white hover:border-slate-400 focus:border-slate-400 dark:bg-slate-950 transition-colors shadow-xs",
                          errors.reason
                            ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 focus-visible:ring-red-500"
                            : "border-slate-300 dark:border-slate-700"
                        )}
                        value={currentData.reason}
                        onChange={(e) => handleChange("reason", e.target.value)}
                      />
                      {errors.reason && (
                        <p className="text-[11px] text-red-500 font-medium">Reason is required</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                    {/* Arrow Connector */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-400 z-10">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* From */}
                    <div className="space-y-3 p-3 rounded-xl bg-slate-100/40 border border-slate-200 dark:bg-slate-900/30 dark:border-slate-800 shadow-sm">
                      <Badge
                        variant="outline"
                        className="bg-white text-slate-500 border-slate-200"
                      >
                        {t("form.original")}
                      </Badge>
                      <div className="space-y-2">
                        {/* Read-only display — date is selected via chips below to guarantee correct weekday */}
                        <div
                          className={cn(
                            "h-9 px-3 flex items-center rounded-md border text-sm transition-colors shadow-xs",
                            errors.originalDate
                              ? "border-red-500 bg-red-50/50 text-red-500 ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/20"
                              : currentData.originalDate
                                ? "bg-white border-slate-300 text-slate-800 font-medium dark:bg-slate-950 dark:border-slate-700"
                                : "bg-slate-50 border-slate-200 text-slate-500 italic dark:bg-slate-900/50 dark:border-slate-800",
                          )}
                        >
                          {currentData.originalDate
                            ? (() => {
                                const [y, m, d] = currentData.originalDate.split("-").map(Number);
                                return new Date(y, m - 1, d).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                });
                              })()
                            : "Select a date from the suggestions below"}</div>
                        {errors.originalDate && (
                          <p className="text-[11px] text-red-500 font-medium">Please select an original date suggestion below</p>
                        )}

                        {selectedSchedule && (
                          <div className="space-y-2 py-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                  Suggested Dates
                                </span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedSchedule.dayOfWeek]}s only
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Date(suggestedBaseDate);
                                    next.setDate(next.getDate() - 7);
                                    setSuggestedBaseDate(next);
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"
                                  title="Previous week"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Date(suggestedBaseDate);
                                    next.setDate(next.getDate() + 7);
                                    setSuggestedBaseDate(next);
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"
                                  title="Next week"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getSuggestedDates(
                                selectedSchedule.dayOfWeek,
                                suggestedBaseDate,
                              ).map((date) => {
                                const dateStr = toLocalDateStr(date);
                                const todayStr = toLocalDateStr(new Date());
                                const isSelected =
                                  currentData.originalDate === dateStr;
                                const isToday = todayStr === dateStr;

                                return (
                                  <button
                                    key={dateStr}
                                    type="button"
                                    onClick={() =>
                                      handleChange("originalDate", dateStr)
                                    }
                                    className={cn(
                                      "text-[10px] px-2 py-1 rounded-md transition-all border",
                                      isSelected
                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50",
                                    )}
                                  >
                                    {date.toLocaleDateString(undefined, {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                    {isToday && " (Today)"}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <Input
                          type="text"
                          className="bg-slate-50 border-slate-200 text-slate-500 font-medium h-9 text-xs cursor-not-allowed dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400 shadow-xs"
                          value={
                            selectedSchedule
                              ? `${selectedSchedule.startTime.slice(0, 5)} - ${selectedSchedule.endTime.slice(0, 5)}`
                              : ""
                          }
                          placeholder="Select original class schedule"
                          readOnly
                        />
                        <Select
                          value={currentData.originalRoom}
                          onValueChange={(v) => {
                            const schedule = availableSchedules.find(
                              (item) => item.id === v,
                            );
                            setErrors((prev) => ({ ...prev, originalRoom: false }));
                            setCurrentData((prev) => {
                              let mappedComponentType = prev.componentType;
                              if (schedule) {
                                const sType = schedule.componentType.toLowerCase();
                                if (sType === "theoretical" || sType === "theoreticalpractical") {
                                  mappedComponentType = "theoretical";
                                } else if (sType === "practical" || sType === "practicallaboratorial") {
                                  mappedComponentType = "practical";
                                }
                              }
                              return {
                                ...prev,
                                originalRoom: v,
                                originalTime: schedule
                                  ? `${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)}`
                                  : "",
                                componentType: mappedComponentType,
                              };
                            });
                            setSuggestedBaseDate(new Date());
                          }}
                        >
                          <SelectTrigger className={cn(
                            "bg-white hover:border-slate-400 focus:border-slate-400 dark:bg-slate-950 h-9 shadow-xs",
                            errors.originalRoom
                              ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 focus:border-red-500"
                              : "border-slate-300 dark:border-slate-700"
                          )}>
                            <SelectValue placeholder="Original schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSchedules.map((schedule) => (
                              <SelectItem key={schedule.id} value={schedule.id}>
                                {getScheduleLabel(schedule)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.originalRoom && (
                          <p className="text-[11px] text-red-500 font-medium">Original schedule is required</p>
                        )}
                      </div>
                    </div>

                    {/* To */}
                    <div className="space-y-3 p-3 rounded-xl bg-blue-50/50 border border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/40 shadow-sm">
                      <Badge
                        variant="outline"
                        className="bg-white text-blue-600 border-blue-200"
                      >
                        {t("form.new_schedule")}
                      </Badge>
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="date"
                            className={cn(
                              "bg-white h-9 pr-10 cursor-pointer custom-datepicker dark:bg-slate-950 shadow-xs",
                              errors.newDate
                                ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 focus-visible:ring-red-500 focus-visible:border-red-500"
                                : "border-blue-300 hover:border-blue-400 focus-visible:ring-blue-400 focus-visible:border-blue-400 dark:border-blue-800 dark:hover:border-blue-700"
                            )}
                            value={currentData.newDate}
                            onChange={(e) =>
                              handleChange("newDate", e.target.value)
                            }
                            onClick={(e) => {
                              try {
                                e.currentTarget.showPicker();
                              } catch {}
                            }}
                          />
                          {errors.newDate && (
                            <p className="text-[11px] text-red-500 font-medium mt-1">New date is required</p>
                          )}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400/50">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M8 2v4" />
                              <path d="M16 2v4" />
                              <rect width="18" height="18" x="3" y="4" rx="2" />
                              <path d="M3 10h18" />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-2 py-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                              Suggested Dates
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Date(compBaseDate);
                                  next.setDate(next.getDate() - 7);
                                  setCompBaseDate(next);
                                }}
                                className="p-1 hover:bg-blue-50 rounded text-blue-400 transition-colors"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Date(compBaseDate);
                                  next.setDate(next.getDate() + 7);
                                  setCompBaseDate(next);
                                }}
                                className="p-1 hover:bg-blue-50 rounded text-blue-400 transition-colors"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getCompensationSuggestions(
                              compBaseDate,
                              currentData.originalDate,
                              selectedClassGroupId,
                            ).map((item) => {
                              const dateStr = toLocalDateStr(item.date);
                              const isSelected =
                                currentData.newDate === dateStr;
                              const isTomorrow =
                                toLocalDateStr(new Date(
                                  new Date().setDate(new Date().getDate() + 1),
                                )) === dateStr;

                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  disabled={item.isConflict}
                                  onClick={() =>
                                    handleChange("newDate", dateStr)
                                  }
                                  className={cn(
                                    "text-[10px] px-2 py-1 rounded-md transition-all border flex flex-col items-center gap-0.5 min-w-[50px]",
                                    isSelected
                                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                      : item.isConflict
                                        ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                                        : "bg-white border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50/50",
                                  )}
                                  title={
                                    item.isConflict
                                      ? "Exceeds 8-hour daily limit"
                                      : `${Math.round(item.hours)}h total on this day`
                                  }
                                >
                                  <span>
                                    {item.date.toLocaleDateString(undefined, {
                                      day: "2-digit",
                                      month: "short",
                                    })}
                                    {isTomorrow && " (Tmw)"}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[8px] opacity-70 font-bold",
                                      item.hours > 6 ? "text-orange-500" : "",
                                    )}
                                  >
                                    {Math.round(item.hours)}h
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <Input
                              type="time"
                              className={cn(
                                "bg-white h-9 flex-1",
                                errors.newTime
                                  ? "border-red-500 ring-2 ring-red-100 dark:border-red-900 focus-visible:ring-red-500"
                                  : "border-blue-200"
                              )}
                              value={currentData.newTime}
                              onChange={(e) =>
                                handleChange("newTime", e.target.value)
                              }
                            />
                            {currentData.newTime && proposedEndTime && (
                              <Badge variant="secondary" className="h-9 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                                {t("requests.ends_at") || "Ends at"} {proposedEndTime}
                              </Badge>
                            )}
                          </div>
                          {errors.newTime && (
                            <p className="text-[11px] text-red-500 font-medium">New time is required</p>
                          )}

                          {classGroupDayInfo && (
                            <div className="space-y-2 py-1">

                              {/* Day Timetable */}
                              {classGroupDayLoading ? (
                                <span className="text-[10px] text-slate-400">Loading timetable...</span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                                    {new Date(currentData.newDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" })} — timetable
                                  </span>
                                  {classGroupDayInfo.busySlots && classGroupDayInfo.busySlots.length > 0 ? (
                                    <div className="space-y-0.5">
                                      {classGroupDayInfo.busySlots.map((slot, idx) => {
                                        const isConflictSlot = classGroupConflict &&
                                          slot.startTime === classGroupConflict.startTime &&
                                          slot.endTime === classGroupConflict.endTime;
                                        const isRegular = slot.type === "ClassSchedule" || slot.type === "TeacherSchedule";
                                        return (
                                          <div
                                            key={idx}
                                            className={cn(
                                              "flex items-center gap-2 px-2 py-1 rounded text-[10px] border",
                                              isConflictSlot
                                                ? "bg-amber-50 border-amber-300 text-amber-800"
                                                : isRegular
                                                  ? "bg-slate-50 border-slate-200 text-slate-600"
                                                  : "bg-blue-50 border-blue-200 text-blue-700"
                                            )}
                                          >
                                            <span className="font-mono font-semibold tabular-nums">
                                              {slot.startTime}–{slot.endTime}
                                            </span>
                                            <span className="text-[9px] opacity-70 uppercase tracking-wide">
                                              {slot.type === "ClassSchedule" ? "regular" :
                                               slot.type === "TeacherSchedule" ? "teacher" :
                                               slot.type === "CompensationRequest" ? "compensation" :
                                               "teacher comp."}
                                            </span>
                                            {isConflictSlot && (
                                              <AlertTriangle className="w-2.5 h-2.5 text-amber-500 ml-auto" />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-medium block">No classes scheduled — day is free</span>
                                  )}
                                </div>
                              )}

                              {/* Free Windows — filtered by compensation duration */}
                              {(() => {
                                const filtered = getFilteredFreeWindows(classGroupDayInfo.freeWindows ?? []);
                                return (
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                                      {t("requests.class_group_free_hours") ?? "Class Group Free Hours"}
                                    </span>
                                    {classGroupDayLoading ? (
                                      <span className="text-[10px] text-slate-400">Loading free hours...</span>
                                    ) : filtered.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {filtered.map((window) => {
                                          const [start] = window.split("–");
                                          const isSelected = currentData.newTime === start;
                                          return (
                                            <button
                                              key={window}
                                              type="button"
                                              onClick={() => handleChange("newTime", start)}
                                              className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-md transition-all border",
                                                isSelected
                                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm font-semibold"
                                                  : "bg-white border-emerald-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50"
                                              )}
                                            >
                                              {window}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-red-500 font-medium block">
                                        No available slot fits this class duration
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}

                            </div>
                          )}

                          {classGroupConflict && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium leading-relaxed mt-2 flex items-start gap-1.5 animate-in fade-in">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span>The selected time overlaps with an existing class: </span>
                                <span className="font-bold underline">
                                  {classGroupConflict.type === "ClassSchedule"
                                    ? "regular class schedule"
                                    : classGroupConflict.type === "TeacherSchedule"
                                      ? "teacher's regular schedule"
                                      : "another compensation request"}
                                </span>
                                <span> ({classGroupConflict.startTime}–{classGroupConflict.endTime}). Pick a time from the free windows above.</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Smart Room Picker — shows availability status after date+time are selected */}
                        {classGroupConflict ? (
                          <div className="h-10 flex items-center justify-center text-xs text-amber-600 border border-amber-200 rounded-md px-3 bg-amber-50/30 italic">
                            Resolve class group conflict to select a classroom
                          </div>
                        ) : roomAvailabilityLoading ? (
                          <div className="h-9 flex items-center gap-2 text-xs text-slate-400 border border-blue-200 rounded-md px-3 bg-white">
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" className="opacity-25" /><path d="M12 2a10 10 0 0 1 10 10" className="opacity-75" /></svg>
                            Checking room availability…
                          </div>
                        ) : roomAvailability.length > 0 ? (
                          <div className="space-y-1.5">
                            <span className={cn("text-[10px] font-medium uppercase tracking-wider", errors.newRoom ? "text-red-500" : "text-slate-400")}>
                              Select Room {errors.newRoom && "— Required"}
                            </span>
                            <div className={cn(
                              "grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5 p-1 rounded-lg",
                              errors.newRoom && "border border-red-300 bg-red-50/10 dark:border-red-950/20"
                            )}>
                              {roomAvailability.map((room) => {
                                const isSelected = currentData.newRoom === room.classroomId;
                                return (
                                  <button
                                    key={room.classroomId}
                                    type="button"
                                    disabled={!room.isAvailable}
                                    onClick={() => room.isAvailable && handleChange("newRoom", room.classroomId)}
                                    title={room.isAvailable ? room.classroomName : (room.conflictInfo ?? "Occupied")}
                                    className={cn(
                                      "relative text-[11px] font-medium px-2 py-1.5 rounded-lg border transition-all text-left leading-tight",
                                      room.isAvailable
                                        ? isSelected
                                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/60 cursor-pointer"
                                        : "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-70",
                                    )}
                                  >
                                    <span className="block truncate">{room.classroomName}</span>
                                    {!room.isAvailable && room.conflictInfo && (
                                      <span className="block text-[9px] truncate text-red-400 mt-0.5">
                                        {room.conflictInfo.replace("Occupied ", "").split(" (")[0]}
                                      </span>
                                    )}
                                    {isSelected && room.isAvailable && (
                                      <span className="absolute top-1 right-1 text-white text-[8px]">✓</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {errors.newRoom && (
                              <p className="text-[11px] text-red-500 font-medium">Classroom selection is required</p>
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            "h-9 flex items-center text-xs border rounded-md px-3 bg-slate-50 italic dark:bg-slate-900/50",
                            errors.newRoom
                              ? "border-red-500 text-red-500 ring-2 ring-red-100 dark:border-red-900 dark:bg-red-950/20"
                              : "border-blue-200 text-slate-400 dark:border-blue-800"
                          )}>
                            Select a date and time to see available rooms
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conflict Warning */}
                  {conflictWarning && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span className="font-medium">
                        {conflictMessage ||
                          t("form.conflict_detected").replace(
                            "{room}",
                            "selected room",
                          )}
                      </span>
                    </div>
                  )}

                  {!isEditMode && (
                    <Button
                      className={cn(
                        "w-full text-white",
                        editingQueueItemId
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-900 hover:bg-slate-800"
                      )}
                      onClick={handleAddToQueue}
                    >
                      {editingQueueItemId ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("form.add_queue")}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 border-t border-slate-200 bg-white">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="mr-auto text-slate-500"
          >
            {t("common.cancel")}
          </Button>

          <Button
            onClick={handleSubmit}
            className={cn(
              "w-full sm:w-auto px-8 transition-all shadow-lg",
              queue.length > 0 || (currentData.course && currentData.newDate)
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                : "bg-slate-200 text-slate-400 pointer-events-none",
            )}
          >
            {isEditMode
              ? t("form.submit_one")
              : t("form.submit_all").replace(
                  "{count}",
                  queue.length +
                    (currentData.course && currentData.newDate ? 1 : 0),
                )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
