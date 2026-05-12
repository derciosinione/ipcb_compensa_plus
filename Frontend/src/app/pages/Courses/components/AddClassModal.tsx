import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '../../../components/ui/select';
import { ClassGroup, CurricularUnit } from '../../../types/academic';
import type { PlatformUser } from '../../../services/users/userTypes';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassGroup, 'id'>) => void | Promise<void>;
  units: CurricularUnit[];
  teachers: PlatformUser[];
}

interface FormData {
  name: string;
  unitId: string;
  teacherId: string;
}

export const AddClassModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  units,
  teachers,
}: AddClassModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        unitId: '',
        teacherId: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    const classData: Omit<ClassGroup, 'id'> = {
      name: data.name,
      unitId: data.unitId,
      teacherId: data.teacherId,
    };

    await onSave(classData);
  };

  const getTeacherName = (teacher: PlatformUser) => teacher.fullName || teacher.email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Class</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Create a new class group for a curricular unit.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">Class Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Class A, PL1" 
              {...register('name', { required: true })} 
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unitId" className="text-slate-700 dark:text-slate-300 font-semibold">Curricular Unit</Label>
            <Select 
              onValueChange={(val) => setValue('unitId', val)}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 rounded-xl">
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} (Year {unit.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label htmlFor="teacherId" className="text-slate-700 dark:text-slate-300 font-semibold">Teacher</Label>
             <Select onValueChange={(val) => setValue('teacherId', val)}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-800 rounded-xl">
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {getTeacherName(teacher)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('teacherId', { required: true })} />
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
              Create Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
