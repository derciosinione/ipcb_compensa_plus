import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { cn } from '../../ui/utils';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { mockRooms } from '../../../mocks/data';
import { useLanguage } from '../../../providers/LanguageContext';

interface CreateRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  onCreate: (data: any) => void;
}

export const CreateRequestSheet = ({ 
  open, 
  onOpenChange, 
  initialDate, 
  initialTime,
  onCreate 
}: CreateRequestSheetProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    unit: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    reason: '',
    type: 'theoretical'
  });

  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({
        ...prev,
        date: initialDate.toISOString().split('T')[0]
      }));
    }
    if (initialTime) {
      setFormData(prev => ({
        ...prev,
        startTime: initialTime,
        endTime: calculateEndTime(initialTime)
      }));
    }
  }, [initialDate, initialTime, open]);

  const calculateEndTime = (start: string) => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    date.setHours(date.getHours() + 2); // Default 2h duration
    return date.toTimeString().slice(0, 5);
  };

  const handleSubmit = () => {
    onCreate(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
        unit: '',
        date: '',
        startTime: '',
        endTime: '',
        room: '',
        reason: '',
        type: 'theoretical'
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{t('sheet.new_compensation')}</SheetTitle>
          <SheetDescription>
            {t('sheet.description')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Unit & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="unit">{t('sheet.unit_course')}</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({...formData, unit: v})}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('sheet.select_unit')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Software Architecture">Software Architecture</SelectItem>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Database Systems">Database Systems</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="type">{t('form.component')}</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('form.select_type')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="theoretical">Theoretical</SelectItem>
                        <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
             <Label>{t('sheet.date_time')}</Label>
             <div className="flex gap-2">
                <div className="relative flex-1">
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        type="date" 
                        className="pl-9" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div className="relative w-24">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        type="time" 
                        className="pl-8" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                </div>
                <div className="flex items-center text-slate-400">-</div>
                <div className="relative w-24">
                    <Input 
                        type="time" 
                        className="text-center" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                </div>
             </div>
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
             <Label>{t('sheet.proposed_room')}</Label>
             <Select value={formData.room} onValueChange={(v) => setFormData({...formData, room: v})}>
                <SelectTrigger>
                    <SelectValue placeholder={t('sheet.select_room')} />
                </SelectTrigger>
                <SelectContent>
                    {mockRooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                            <span className="flex items-center justify-between w-full gap-2">
                                <span>{room.name} <span className="text-slate-400 text-xs">({room.type})</span></span>
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full",
                                    // Mock availability logic just for visual demo
                                    Math.random() > 0.3 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                )}>
                                    {Math.random() > 0.3 ? t('sheet.avail') : t('sheet.busy')}
                                </span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
             </Select>
             <p className="text-[11px] text-slate-500 flex items-center gap-1">
                 <MapPin className="w-3 h-3" />
                 {t('sheet.checking_availability').replace('{date}', formData.date || 'selected date')}
             </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
             <Label htmlFor="reason">{t('details.justification')}</Label>
             <Textarea 
                id="reason" 
                placeholder={t('form.reason_placeholder')}
                className="resize-none min-h-[100px]"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
             />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </SheetClose>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
            {t('sheet.create_request')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};