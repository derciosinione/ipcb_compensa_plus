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
import { Textarea } from '../../../components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '../../../components/ui/select';
import { Course } from '../../../types/academic';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../../../providers/LanguageContext';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Omit<Course, 'id'>) => void;
}

interface FormData {
  name: string;
  abbreviation: string;
  type: 'Licenciatura' | 'Mestrado' | 'CTeSP';
  description: string;
  durationYears: string;
  totalCredits: string;
  coordinatorId: string;
}

export const AddCourseModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: AddCourseModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        abbreviation: '',
        type: 'Licenciatura',
        description: '',
        durationYears: '3',
        totalCredits: '180',
        coordinatorId: ''
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data: FormData) => {
    const courseData: Omit<Course, 'id'> = {
      name: data.name,
      abbreviation: data.abbreviation,
      description: data.description,
      type: data.type,
      durationYears: parseInt(data.durationYears),
      totalCredits: parseInt(data.totalCredits),
      coordinatorId: data.coordinatorId,
      image: ''
    };

    onSave(courseData);
    onClose();
    toast.success(t('modal.success_course'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('modal.add_course_title')}</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {t('modal.add_course_desc')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-4 gap-4">
             <div className="col-span-3 space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">{t('modal.course_name')}</Label>
                <Input 
                  id="name" 
                  placeholder={t('modal.course_name_placeholder')} 
                  {...register('name', { required: true })} 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
             </div>
             <div className="col-span-1 space-y-2">
                <Label htmlFor="abbreviation" className="text-slate-700 dark:text-slate-300 font-semibold">{t('modal.abbr')}</Label>
                <Input 
                  id="abbreviation" 
                  placeholder="LEI" 
                  {...register('abbreviation', { required: true })} 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
             </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-700 dark:text-slate-300 font-semibold">{t('modal.degree_type')}</Label>
            <Select 
                onValueChange={(val) => setValue('type', val as any)} 
                defaultValue="Licenciatura"
            >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder={t('modal.select_type')} />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="Licenciatura">Licenciatura (Bachelor's)</SelectItem>
                    <SelectItem value="Mestrado">Mestrado (Master's)</SelectItem>
                    <SelectItem value="CTeSP">CTeSP</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="durationYears" className="text-slate-700 dark:text-slate-300 font-semibold">{t('modal.duration')}</Label>
                <Input 
                  id="durationYears" 
                  type="number"
                  placeholder="3" 
                  {...register('durationYears', { required: true, min: 1 })} 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="totalCredits" className="text-slate-700 dark:text-slate-300 font-semibold">{t('modal.total_ects')}</Label>
                <Input 
                  id="totalCredits" 
                  type="number"
                  placeholder="180" 
                  {...register('totalCredits', { required: true, min: 1 })} 
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
             </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-semibold">{t('modal.description')}</Label>
             <Textarea 
                id="description" 
                placeholder={t('modal.desc_placeholder')}
                {...register('description', { required: true })}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 min-h-[100px]"
             />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {t('modal.create_course')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
