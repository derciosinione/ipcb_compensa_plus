import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ClassGroup, CurricularUnit } from "../../../types/academic";
import type { PlatformUser } from "../../../services/users/userTypes";
import { useLanguage } from "../../../providers/LanguageContext";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassGroup, "id">) => void | Promise<void>;
  durationYears: number;
  teachers: PlatformUser[];
}

interface FormData {
  name: string;
  year: number;
  teacherId: string;
}

export const AddClassModal = ({
  isOpen,
  onClose,
  onSave,
  durationYears,
  teachers,
}: AddClassModalProps) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        year: 1,
        teacherId: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    const classData: Omit<ClassGroup, "id"> = {
      name: data.name,
      year: Number(data.year),
      teacherId: data.teacherId || "",
    };

    await onSave(classData);
  };

  const getTeacherName = (teacher: PlatformUser) =>
    teacher.fullName || teacher.email;

  const years = Array.from({ length: durationYears }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("class_modal.title")}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {t("class_modal.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-slate-700 dark:text-slate-300 font-semibold"
            >
              {t("class_modal.class_name")}
            </Label>
            <Input
              id="name"
              placeholder={t("class_modal.placeholder_name")}
              {...register("name", { required: true })}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold">
              {t("class_modal.academic_year")}
            </Label>
            <Select
              defaultValue="1"
              onValueChange={(val) => setValue("year", Number(val))}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder={t("class_modal.placeholder_year")} />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 rounded-xl">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {t("courses.year_label").replace("{year}", y.toString())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="teacherId"
              className="text-slate-700 dark:text-slate-300 font-semibold"
            >
              {t("class_modal.teacher_label")}
            </Label>
            <Select onValueChange={(val) => setValue("teacherId", val)}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder={t("class_modal.placeholder_teacher")} />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 rounded-xl">
                <SelectItem value="unassigned">{t("class_modal.none")}</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {getTeacherName(teacher)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {t("class_modal.btn_create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
