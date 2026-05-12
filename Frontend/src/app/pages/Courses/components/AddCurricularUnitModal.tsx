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
import { CurricularUnit } from "../../../types/academic";

interface AddCurricularUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Omit<CurricularUnit, "id">) => void | Promise<void>;
  courseId: string;
  year: number;
  initialData?: CurricularUnit; // For editing
}

interface FormData {
  name: string;
  semester: string;
  ects: string;
  component: "Theoretical" | "Practical" | "All";
}

export const AddCurricularUnitModal = ({
  isOpen,
  onClose,
  onSave,
  courseId,
  year,
  initialData,
}: AddCurricularUnitModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("semester", initialData.semester.toString());
        setValue("ects", initialData.ects.toString());
        setValue("component", initialData.component || "All");
      } else {
        reset({
          name: "",
          semester: "1",
          ects: "6",
          component: "All",
        });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    const unitData: Omit<CurricularUnit, "id"> = {
      name: data.name,
      courseId,
      year,
      semester: parseInt(data.semester) as 1 | 2,
      ects: parseInt(data.ects),
      teacherIds: initialData ? initialData.teacherIds : [], // Preserve teachers if editing
      component: data.component,
    };

    await onSave(unitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Curricular Unit" : "Add Curricular Unit"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {initialData
              ? "Edit the details of the curricular unit."
              : `Add a new curricular unit to Year ${year} of the course.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-slate-700 dark:text-slate-300 font-semibold"
            >
              Unit Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Software Engineering"
              {...register("name", { required: true })}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="semester"
                className="text-slate-700 dark:text-slate-300 font-semibold"
              >
                Semester
              </Label>
              <Select
                onValueChange={(val) => setValue("semester", val)}
                defaultValue={
                  initialData ? initialData.semester.toString() : "1"
                }
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800 rounded-xl">
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="ects"
                className="text-slate-700 dark:text-slate-300 font-semibold"
              >
                ECTS Credits
              </Label>
              <Input
                id="ects"
                type="number"
                placeholder="6"
                {...register("ects", { required: true, min: 1 })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="component"
              className="text-slate-700 dark:text-slate-300 font-semibold"
            >
              Component Type
            </Label>
            <Select
              onValueChange={(val) =>
                setValue(
                  "component",
                  val as "Theoretical" | "Practical" | "All",
                )
              }
              defaultValue={initialData ? initialData.component : "All"}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder="Select component type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 rounded-xl">
                <SelectItem value="All">All (Theory + Practice)</SelectItem>
                <SelectItem value="Theoretical">Theoretical Only</SelectItem>
                <SelectItem value="Practical">Practical Only</SelectItem>
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
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {initialData ? "Save Changes" : "Create Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
