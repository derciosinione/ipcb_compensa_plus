import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '../ui/select';
import { CurricularUnit, mockTeachers, User } from './data';
import { toast } from 'sonner@2.0.3';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface AssignTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unitId: string, assignments: { regentId: string, theoreticalTeacherId?: string, practicalTeacherId?: string }) => void;
  unit?: CurricularUnit;
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
  unit 
}: AssignTeachersModalProps) => {
  const { control, handleSubmit, reset, watch } = useForm<FormData>();
  
  useEffect(() => {
    if (isOpen && unit) {
      reset({
        regentId: unit.regentId || '',
        theoreticalTeacherId: unit.theoreticalTeacherId || '',
        practicalTeacherId: unit.practicalTeacherId || ''
      });
    }
  }, [isOpen, unit, reset]);

  const onSubmit = (data: FormData) => {
    if (!unit) return;
    
    onSave(unit.id, {
        regentId: data.regentId,
        theoreticalTeacherId: data.theoreticalTeacherId || undefined,
        practicalTeacherId: data.practicalTeacherId || undefined
    });
    
    onClose();
    toast.success(`Teachers assigned to ${unit.name}`);
  };

  if (!unit) return null;

  const showTheoretical = unit.component === 'All' || unit.component === 'Theoretical';
  const showPractical = unit.component === 'All' || unit.component === 'Practical';

  const renderTeacherOption = (teacher: User) => (
      <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
              <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{teacher.name}</span>
      </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Assign Teachers</DialogTitle>
          <DialogDescription>
            Assign faculty members to <strong>{unit.name}</strong> components.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          
          {/* Regent Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Regent (Principal Teacher)</Label>
            <p className="text-xs text-slate-500">Responsible for the curricular unit coordination.</p>
            <Controller
              name="regentId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Regent" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map(teacher => (
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
                        Theoretical Component
                    </Label>
                    <Controller
                      name="theoreticalTeacherId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Select Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTeachers.map(teacher => (
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
                        Practical Component
                    </Label>
                    <Controller
                      name="practicalTeacherId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Select Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockTeachers.map(teacher => (
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Assignments</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
