import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { CurricularUnit } from "../../../types/academic";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { ScrollArea } from "../../../components/ui/scroll-area";
import type { PlatformUser } from "../../../services/users/userTypes";
import { useLanguage } from "../../../providers/LanguageContext";

interface AssignTeacherToCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    teacherId: string;
    unitId: string;
    roles: { regent: boolean; theoretical: boolean; practical: boolean };
  }) => void | Promise<void>;
  courseUnits: CurricularUnit[];
  teachers: PlatformUser[];
}

export const AssignTeacherToCourseModal = ({
  isOpen,
  onClose,
  onSave,
  courseUnits,
  teachers,
}: AssignTeacherToCourseModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const { t } = useLanguage();

  const [roles, setRoles] = useState({
    regent: false,
    theoretical: false,
    practical: false,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedTeacherId("");
      setSelectedUnitId("");
      setRoles({ regent: false, theoretical: false, practical: false });
    }
  }, [isOpen]);

  const getTeacherName = (teacher: PlatformUser) =>
    teacher.fullName || teacher.email;

  const filteredTeachers = teachers.filter(
    (t) =>
      getTeacherName(t).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSave = async () => {
    if (!selectedTeacherId) {
      toast.error(t("assign_course.toast_select_teacher"));
      return;
    }
    if (!selectedUnitId) {
      toast.error(t("assign_course.toast_select_unit"));
      return;
    }
    if (!roles.regent && !roles.theoretical && !roles.practical) {
      toast.error(t("assign_course.toast_select_component"));
      return;
    }

    await onSave({
      teacherId: selectedTeacherId,
      unitId: selectedUnitId,
      roles,
    });
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedUnit = courseUnits.find((u) => u.id === selectedUnitId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>{t("assign_course.title")}</DialogTitle>
          <DialogDescription>
            {t("assign_course.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Teacher Selection */}
          <div className="space-y-4">
            <Label>{t("assign_course.label_teacher")}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t("assign_course.search_placeholder")}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden h-[250px]">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedTeacherId === teacher.id
                          ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getTeacherName(teacher))}&background=random`}
                        />
                        <AvatarFallback>
                          {getTeacherName(teacher)[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {getTeacherName(teacher)}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-4">
                      {t("assign_course.no_teachers")}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right Column: Unit & Role Selection */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>{t("assign_course.label_unit")}</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("assign_course.placeholder_unit")} />
                </SelectTrigger>
                <SelectContent>
                  {courseUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUnit && (
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                  {t("assign_course.unit_info")
                    .replace("{year}", selectedUnit.year.toString())
                    .replace("{semester}", selectedUnit.semester.toString())}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className={!selectedUnitId ? "opacity-50" : ""}>
                {t("assign_course.label_components")}
              </Label>
              <div
                className={`space-y-3 border border-slate-200 dark:border-slate-800 rounded-lg p-4 ${!selectedUnitId ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-regent"
                    checked={roles.regent}
                    onCheckedChange={(c) =>
                      setRoles((prev) => ({ ...prev, regent: c as boolean }))
                    }
                  />
                  <Label
                    htmlFor="role-regent"
                    className="font-normal cursor-pointer"
                  >
                    {t("assign_course.regent_head")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-theoretical"
                    checked={roles.theoretical}
                    onCheckedChange={(c) =>
                      setRoles((prev) => ({
                        ...prev,
                        theoretical: c as boolean,
                      }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <Label
                      htmlFor="role-theoretical"
                      className="font-normal cursor-pointer"
                    >
                      {t("component.theoretical")}
                    </Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-practical"
                    checked={roles.practical}
                    onCheckedChange={(c) =>
                      setRoles((prev) => ({ ...prev, practical: c as boolean }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <Label
                      htmlFor="role-practical"
                      className="font-normal cursor-pointer"
                    >
                      {t("component.practical")}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {selectedTeacher && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">
                  {t("assign_course.assigning_info").replace("{name}", getTeacherName(selectedTeacher))}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("assign_course.btn_assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
