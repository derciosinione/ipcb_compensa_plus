import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '../ui/select';
import { ClassGroup, CurricularUnit } from './data';
import { toast } from 'sonner@2.0.3';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassGroup, 'id'>) => void;
  units: CurricularUnit[];
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
  units
}: AddClassModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        unitId: '',
        teacherId: 'u1' // Defaulting to current user for mock
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormData) => {
    const classData: Omit<ClassGroup, 'id'> = {
      name: data.name,
      unitId: data.unitId,
      teacherId: data.teacherId,
    };

    onSave(classData);
    onClose();
    toast.success("Class created successfully");
  };

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
             <Label htmlFor="teacherId" className="text-slate-700 dark:text-slate-300 font-semibold">Teacher ID</Label>
             <Input 
                id="teacherId" 
                placeholder="u1"
                {...register('teacherId', { required: true })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg"
             />
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
