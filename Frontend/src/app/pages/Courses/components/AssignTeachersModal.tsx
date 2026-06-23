import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { CurricularUnit } from "../../../types/academic";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import type { PlatformUser } from "../../../services/users/userTypes";
import { useLanguage } from "../../../providers/LanguageContext";

interface AssignTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    unitId: string,
    assignments: {
      regentId: string;
      theoreticalTeacherId?: string;
      practicalTeacherId?: string;
    },
  ) => void | Promise<void>;
  unit?: CurricularUnit;
  teachers: PlatformUser[];
}

interface FormData {
  regentId: string;
  theoreticalTeacherId: string;
  practicalTeacherId: string;
}

export const AssignTeachersModal = ({
  isOpen,
  onClose,
  onSave,
  unit,
  teachers,
}: AssignTeachersModalProps) => {
  const { control, handleSubmit, reset, watch } = useForm<FormData>();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && unit) {
      reset({
        regentId: unit.regentId || "",
        theoreticalTeacherId: unit.theoreticalTeacherId || "",
        practicalTeacherId: unit.practicalTeacherId || "",
      });
    }
  }, [isOpen, unit, reset]);

  const onSubmit = async (data: FormData) => {
    if (!unit) return;

    await onSave(unit.id, {
      regentId: data.regentId,
      theoreticalTeacherId: data.theoreticalTeacherId || undefined,
      practicalTeacherId: data.practicalTeacherId || undefined,
    });
  };

  if (!unit) return null;

  const showTheoretical =
    unit.component === "All" || unit.component === "Theoretical";
  const showPractical =
    unit.component === "All" || unit.component === "Practical";

  const getTeacherName = (teacher: PlatformUser) =>
    teacher.fullName || teacher.email;

  const renderTeacherOption = (teacher: PlatformUser) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getTeacherName(teacher))}&background=random`}
          alt={getTeacherName(teacher)}
        />
        <AvatarFallback>{getTeacherName(teacher).charAt(0)}</AvatarFallback>
      </Avatar>
      <span>{getTeacherName(teacher)}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>{t("assign_teachers.title")}</DialogTitle>
          <DialogDescription>
            {t("assign_teachers.description").replace("{name}", unit.name)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Regent Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t("assign_teachers.regent")}
            </Label>
            <p className="text-xs text-slate-500">
              {t("assign_teachers.regent_desc")}
            </p>
            <Controller
              name="regentId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("assign_teachers.placeholder_regent")} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {renderTeacherOption(teacher)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Theoretical Component */}
            {showTheoretical && (
              <div className="space-y-3 p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                <Label className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {t("assign_teachers.theoretical")}
                </Label>
                <Controller
                  name="theoreticalTeacherId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                        <SelectValue placeholder={t("assign_teachers.placeholder_teacher")} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {renderTeacherOption(teacher)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Practical Component */}
            {showPractical && (
              <div className="space-y-3 p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                <Label className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {t("assign_teachers.practical")}
                </Label>
                <Controller
                  name="practicalTeacherId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                        <SelectValue placeholder={t("assign_teachers.placeholder_teacher")} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {renderTeacherOption(teacher)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("assign_teachers.btn_save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
