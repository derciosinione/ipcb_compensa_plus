import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { cn } from "../../../components/ui/utils";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Badge } from "../../../components/ui/badge";
import type {
  Course,
  CurricularUnit,
} from "../../../services/courses/courseTypes";
import type { PlatformUser } from "../../../services/users/userTypes";
import type { CourseAssignmentInput } from "../../../services/assignments/assignmentTypes";
import { useLanguage } from "../../../providers/LanguageContext";

interface TeacherUnitsModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (
    curricularUnitIds: string[],
    courses: CourseAssignmentInput[],
  ) => Promise<void> | void;
  user?: PlatformUser;
  courses: Course[];
  units: CurricularUnit[];
  assignedUnitIds: string[];
  assignedCourses: CourseAssignmentInput[];
}

export const TeacherUnitsModal = ({
  isOpen,
  isSaving = false,
  onClose,
  onSave,
  user,
  courses,
  units,
  assignedUnitIds,
  assignedCourses,
}: TeacherUnitsModalProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCourses, setSelectedCourses] = useState<Map<string, boolean>>(
    new Map(),
  );
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setSelectedCourseId(courses[0]?.id ?? "");
      setSelectedUnitIds(new Set(assignedUnitIds));
      setSelectedCourses(
        new Map(
          assignedCourses.map((course) => [
            course.courseId,
            course.isCoordinator,
          ]),
        ),
      );
    }
  }, [assignedCourses, assignedUnitIds, courses, isOpen]);

  const currentCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const currentCourseUnits = useMemo(
    () => units.filter((unit) => unit.courseId === selectedCourseId),
    [selectedCourseId, units],
  );

  const handleToggleUnit = (unitId: string, checked: boolean) => {
    const unit = units.find((item) => item.id === unitId);

    setSelectedUnitIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (checked) {
        nextIds.add(unitId);
      } else {
        nextIds.delete(unitId);
      }

      return nextIds;
    });

    if (checked && unit) {
      setSelectedCourses((currentCourses) => {
        if (currentCourses.has(unit.courseId)) {
          return currentCourses;
        }

        const nextCourses = new Map(currentCourses);
        nextCourses.set(unit.courseId, false);
        return nextCourses;
      });
    }
  };

  const handleToggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourses((currentCourses) => {
      const nextCourses = new Map(currentCourses);

      if (checked) {
        nextCourses.set(courseId, nextCourses.get(courseId) ?? false);
      } else {
        nextCourses.delete(courseId);
      }

      return nextCourses;
    });
  };

  const handleToggleCoordinator = (courseId: string, checked: boolean) => {
    setSelectedCourses((currentCourses) => {
      const nextCourses = new Map(currentCourses);
      nextCourses.set(courseId, checked);
      return nextCourses;
    });
  };

  const handleSave = async () => {
    const courseAssignments = Array.from(selectedCourses.entries()).map(
      ([courseId, isCoordinator]) => ({
        courseId,
        isCoordinator,
      }),
    );

    await onSave(Array.from(selectedUnitIds), courseAssignments);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px] md:max-w-[850px] lg:max-w-[950px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("users.assign_modal_title")}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {t("users.assign_modal_desc").replace("{name}", user.fullName || user.email)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 overflow-y-auto max-h-[60vh] pr-2">
          {/* Left Column: Course Access */}
          <div className="flex flex-col space-y-3">
            <div>
              <Label className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {t("users.assign_course_access")}
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("users.assign_course_access_desc")}
              </p>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col min-h-[300px] md:min-h-[400px]">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-500 tracking-wider uppercase">
                {t("users.courses_count").replace("{count}", courses.length.toString())}
              </div>
              <ScrollArea className="flex-1 h-[350px]">
                <div className="p-3 space-y-2 bg-white dark:bg-slate-900">
                  {courses.map((course) => {
                    const isAssigned = selectedCourses.has(course.id);
                    const isCoordinator = selectedCourses.get(course.id) ?? false;

                    return (
                      <div
                        key={course.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg border p-3 transition-all duration-200",
                          isAssigned 
                            ? "border-blue-200 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-900/10 shadow-sm" 
                            : "border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        )}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                          <Checkbox
                            checked={isAssigned}
                            onCheckedChange={(checked) =>
                              handleToggleCourse(course.id, Boolean(checked))
                            }
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {course.name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium font-mono">
                              {course.abbreviation} • {course.type}
                            </span>
                          </div>
                        </label>
                        
                        <label className={cn(
                          "flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-md transition-all select-none cursor-pointer",
                          isAssigned 
                            ? "opacity-100" 
                            : "opacity-40 pointer-events-none"
                        )}>
                          <Checkbox
                            checked={isCoordinator}
                            disabled={!isAssigned}
                            onCheckedChange={(checked) =>
                              handleToggleCoordinator(course.id, Boolean(checked))
                            }
                          />
                          <span className={isCoordinator ? "text-blue-600 dark:text-blue-400 animate-pulse" : "text-slate-500"}>
                            {t("role.coordinator")}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right Column: Unit Assignments */}
          <div className="flex flex-col space-y-4">
            <div>
              <Label className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {t("users.assign_units_title")}
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("users.assign_units_desc")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t("users.select_course_view_units")}
              </Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <SelectValue placeholder={t("users.select_course_placeholder")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col min-h-[250px] md:min-h-[320px]">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-500 tracking-wider uppercase flex justify-between items-center">
                <span>{t("users.available_units")}</span>
                {currentCourse && (
                  <Badge variant="outline" className="bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-bold border-none px-2 py-0.5 text-[10px]">
                    {currentCourse.abbreviation}
                  </Badge>
                )}
              </div>
              
              <ScrollArea className="flex-1 h-[270px]">
                <div className="p-3 space-y-2 bg-white dark:bg-slate-900">
                  {currentCourseUnits.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 text-sm font-medium">
                      {t("users.no_units_course")}
                    </div>
                  ) : (
                    currentCourseUnits.map((unit) => {
                      const isAssigned = selectedUnitIds.has(unit.id);

                      return (
                        <div
                          key={unit.id}
                          className={cn(
                            "flex items-start space-x-3 p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl border border-transparent transition-all duration-200",
                            isAssigned && "bg-blue-50/10 dark:bg-blue-900/5 border-slate-100 dark:border-slate-800"
                          )}
                        >
                          <Checkbox
                            id={unit.id}
                            checked={isAssigned}
                            onCheckedChange={(checked) =>
                              handleToggleUnit(unit.id, Boolean(checked))
                            }
                            className="mt-0.5"
                          />
                          <div className="grid gap-1 flex-1 leading-none select-none">
                            <label
                              htmlFor={unit.id}
                              className="text-sm font-semibold leading-tight cursor-pointer text-slate-800 dark:text-slate-200"
                            >
                              {unit.name}
                            </label>
                            <div className="flex gap-2 text-[10px] text-slate-500 font-medium mt-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 font-normal border-slate-200 dark:border-slate-800"
                              >
                                {t("courses.year_label").replace("{year}", unit.year.toString())}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 font-normal border-slate-200 dark:border-slate-800"
                              >
                                {t("courses.semester_label").replace("{semester}", unit.semester.toString())}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 font-normal border-slate-200 dark:border-slate-800"
                              >
                                {t("courses.ects_label").replace("{count}", unit.ects.toString())}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {t("users.total_courses_assigned")
              .replace("{cCount}", selectedCourses.size.toString())
              .replace("{uCount}", selectedUnitIds.size.toString())}
          </div>
          <DialogFooter className="w-full sm:w-auto flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl flex-1 sm:flex-initial"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex-1 sm:flex-initial shadow-md shadow-blue-500/20"
              disabled={isSaving}
            >
              {isSaving ? t("users.saving") : t("assign_teachers.btn_save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
