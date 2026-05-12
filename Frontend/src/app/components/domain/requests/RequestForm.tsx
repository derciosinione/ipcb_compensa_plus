import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../ui/sheet';
import { AlertTriangle, ArrowRight, Plus, Trash2, Check, ChevronsUpDown, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '../../ui/utils';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../../../providers/LanguageContext';
import { listCourses, getCourseDetails } from '../../../services/courses/coursesApi';
import type { Course, CourseDetails, ClassSchedule } from '../../../services/courses/courseTypes';
import { listClassrooms } from '../../../services/classrooms/classroomsApi';
import type { Classroom } from '../../../services/classrooms/classroomTypes';
import { getActiveAcademicYear } from '../../../services/academicYears/academicYearsApi';
import type { AcademicYear } from '../../../services/academicYears/academicYearTypes';
import { checkScheduleAvailability } from '../../../services/schedules/schedulesApi';

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any | any[]) => void;
  initialData?: any; // If provided, enables "Edit Mode"
}

interface RequestFormData {
  id: string;
  course: string;
  unit: string;
  yearGroups: string[];
  componentType: string;
  originalDate: string;
  originalTime: string;
  originalRoom: string;
  newDate: string;
  newTime: string;
  newRoom: string;
  reason: string;
}

const initialFormState = {
  course: '',
  unit: '',
  yearGroups: [] as string[],
  componentType: 'all',
  originalDate: '',
  originalTime: '',
  originalRoom: '',
  newDate: '',
  newTime: '',
  newRoom: '',
  reason: ''
};

export const RequestForm = ({ open, onOpenChange, onSubmit, initialData }: RequestFormProps) => {
  const [queue, setQueue] = useState<RequestFormData[]>([]);
  const [currentData, setCurrentData] = useState<Omit<RequestFormData, 'id'>>(initialFormState);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState<AcademicYear | null>(null);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);
  const { t } = useLanguage();

  // Edit Mode Flag
  const isEditMode = !!initialData;

  useEffect(() => {
    if (!open) return;

    const loadFormContext = async () => {
      try {
        const [loadedCourses, loadedClassrooms, loadedAcademicYear] = await Promise.all([
          listCourses(),
          listClassrooms(),
          getActiveAcademicYear(),
        ]);

        setCourses(loadedCourses.filter(course => course.isActive));
        setClassrooms(loadedClassrooms.filter(classroom => classroom.isActive));
        setActiveAcademicYear(loadedAcademicYear ?? null);
      } catch {
        toast.error('Unable to load academic data for the request form.');
      }
    };

    void loadFormContext();
  }, [open]);

  useEffect(() => {
    if (!currentData.course) {
      setCourseDetails(null);
      return;
    }

    const loadSelectedCourse = async () => {
      try {
        const details = await getCourseDetails(currentData.course);
        setCourseDetails(details ?? null);
      } catch {
        toast.error('Unable to load course details.');
      }
    };

    void loadSelectedCourse();
  }, [currentData.course]);

  useEffect(() => {
    if (initialData) {
        // Populate form if in edit mode
        setCurrentData({
            course: initialData.course || '',
            unit: initialData.unit || '',
            yearGroups: initialData.yearGroups || [],
            componentType: initialData.componentType || 'all',
            originalDate: initialData.originalDate || '',
            originalTime: initialData.originalTime || '',
            originalRoom: initialData.originalRoom || '',
            newDate: initialData.newDate || '',
            newTime: initialData.newTime || '',
            newRoom: initialData.newRoom || '',
            reason: initialData.reason || '',
        });
        setQueue([]); // Clear queue in edit mode
    } else {
        // Reset if opening in create mode
        if (open) {
            setCurrentData(initialFormState);
            setQueue([]);
        }
    }
  }, [initialData, open]);

  const addDuration = (startTime: string, durationSource: string) => {
    const [sourceStart, sourceEnd] = durationSource.split('-').map(value => value.trim());
    const [sourceStartHour, sourceStartMinute] = sourceStart.split(':').map(Number);
    const [sourceEndHour, sourceEndMinute] = sourceEnd.split(':').map(Number);
    const durationMinutes = (sourceEndHour * 60 + sourceEndMinute) - (sourceStartHour * 60 + sourceStartMinute);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + Math.max(durationMinutes, 60);
    const endHour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endMinute = (totalMinutes % 60).toString().padStart(2, '0');

    return `${endHour}:${endMinute}`;
  };

  const handleChange = (field: keyof typeof initialFormState, value: any) => {
    setCurrentData(prev => {
      const next = { ...prev, [field]: value };

      if (field === 'course') {
        next.unit = '';
        next.yearGroups = [];
        next.originalRoom = '';
        next.originalTime = '';
      }

      if (field === 'unit') {
        next.yearGroups = [];
        next.originalRoom = '';
        next.originalTime = '';
      }

      return next;
    });
  };

  const availableClasses = courseDetails?.classes.filter(group => group.curricularUnitId === currentData.unit) ?? [];
  const selectedClassGroupId = currentData.yearGroups[0];
  const availableSchedules = (courseDetails?.schedules ?? []).filter(
    schedule => schedule.classGroupId === selectedClassGroupId,
  );
  const selectedSchedule = availableSchedules.find(schedule => schedule.id === currentData.originalRoom);

  useEffect(() => {
    const canCheck =
      activeAcademicYear &&
      selectedSchedule &&
      selectedClassGroupId &&
      currentData.newDate &&
      currentData.newTime &&
      currentData.newRoom &&
      currentData.originalTime;

    if (!canCheck) {
      setConflictWarning(false);
      setConflictMessage('');
      return;
    }

    const checkAvailability = async () => {
      try {
        const availability = await checkScheduleAvailability({
          academicYearId: activeAcademicYear.id,
          semester: selectedSchedule.semester,
          date: currentData.newDate,
          startTime: currentData.newTime,
          endTime: addDuration(currentData.newTime, currentData.originalTime),
          classGroupId: selectedClassGroupId,
          classroomId: currentData.newRoom,
          excludedScheduleId: selectedSchedule.id,
        });

        const conflicts = availability?.conflicts ?? [];
        setConflictWarning(conflicts.length > 0);
        setConflictMessage(conflicts[0]?.message ?? '');
      } catch {
        setConflictWarning(false);
        setConflictMessage('');
      }
    };

    void checkAvailability();
  }, [
    activeAcademicYear,
    currentData.newDate,
    currentData.newRoom,
    currentData.newTime,
    currentData.originalTime,
    selectedClassGroupId,
    selectedSchedule,
  ]);

  const getScheduleLabel = (schedule: ClassSchedule) => {
    const room = classrooms.find(item => item.id === schedule.classroomId);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[schedule.dayOfWeek] ?? 'Day'} ${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)} · ${room?.name ?? 'Room'}`;
  };

  const handleAddToQueue = () => {
    if (!currentData.course || !currentData.unit || !currentData.originalRoom || !currentData.originalDate || !currentData.newDate || currentData.yearGroups.length === 0) {
      toast.error(t('form.fill_required'));
      return;
    }

    if (conflictWarning) {
      toast.error(conflictMessage || 'Resolve the schedule conflict before adding this request.');
      return;
    }

    const newRequest: RequestFormData = {
      ...currentData,
      id: createLocalId(),
    };

    setQueue(prev => [...prev, newRequest]);
    
    setCurrentData(prev => ({
      ...prev,
      originalDate: '',
      originalTime: '',
      originalRoom: '',
      newDate: '',
      newTime: '',
      newRoom: '',
      reason: '',
    }));
    
    setConflictWarning(false);
    toast.success(t('form.added_queue'));
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (isEditMode) {
        if (conflictWarning) {
            toast.error(conflictMessage || 'Resolve the schedule conflict before submitting this request.');
            return;
        }

        // Submit single updated object
        onSubmit({ ...currentData, academicYearId: activeAcademicYear?.id, id: initialData.id });
        onOpenChange(false);
        toast.success(t('form.updated_success'));
        return;
    }

    // Batch Mode
    if (!activeAcademicYear) {
        toast.error('Active academic year was not found.');
        return;
    }

    if (queue.length === 0 && (!currentData.course || !currentData.newDate)) {
        toast.error(t('form.no_submit'));
        return;
    }

    let finalQueue = [...queue];
    const isFormDirty = currentData.course && currentData.newDate && currentData.yearGroups.length > 0;
    
    if (isFormDirty) {
        if (conflictWarning) {
            toast.error(conflictMessage || 'Resolve the schedule conflict before submitting this request.');
            return;
        }

        finalQueue.push({ ...currentData, id: createLocalId() });
    }

    onSubmit(finalQueue.map(item => ({ ...item, academicYearId: activeAcademicYear.id })));
    setQueue([]);
    setCurrentData(initialFormState);
    onOpenChange(false);
    toast.success(t('form.submitted_success').replace('{count}', finalQueue.length.toString()));
  };

  const createLocalId = () => crypto.randomUUID?.() ?? `local-${Date.now()}`;

  const clearForm = () => {
      setCurrentData(initialFormState);
      setConflictWarning(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] w-full p-0 flex flex-col h-full bg-[#f8fafc] border-l border-slate-200 shadow-2xl">
        <SheetHeader className="px-6 py-6 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
             <div>
                <SheetTitle className="text-xl font-bold text-slate-900">
                    {isEditMode ? t('form.edit_title') : t('form.new_title')}
                </SheetTitle>
                <SheetDescription className="text-slate-500 mt-1">
                    {isEditMode ? t('form.edit_desc') : t('form.new_desc')}
                </SheetDescription>
             </div>
             {!isEditMode && queue.length > 0 && (
                 <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                    {t('form.pending_badge').replace('{count}', queue.length.toString())}
                 </Badge>
             )}
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-8">
                
                {/* Queue Section - ONLY show if NOT in Edit Mode */}
                {!isEditMode && queue.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           {t('form.ready_submit').replace('{count}', queue.length.toString())}
                        </h3>
                        <div className="grid gap-3">
                            {queue.map((req) => (
                                <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-slate-900 text-sm">{req.unit}</h4>
                                                {req.componentType !== 'all' && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-slate-300 text-slate-500 uppercase">
                                                        {req.componentType}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {req.course} • <span className="font-medium text-slate-700">{req.yearGroups.join(", ")}</span>
                                            </p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleRemoveFromQueue(req.id)}
                                            className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="font-medium text-slate-700">{req.originalDate}</span>
                                            <span className="text-slate-400">{req.originalTime}</span>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                        <div className="flex items-center gap-1.5 text-blue-600">
                                            <span className="font-bold">{req.newDate}</span>
                                            <span className="font-medium">{req.newTime}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            {isEditMode ? t('form.request_details') : (
                                <>
                                    <Plus className="w-4 h-4" /> {t('form.add_request')}
                                </>
                            )}
                         </h3>
                         {!isEditMode && queue.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearForm} className="h-7 text-xs text-slate-500 hover:text-slate-700">
                                {t('form.clear_form')}
                            </Button>
                         )}
                    </div>

                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-5 space-y-6">
                            {/* Context */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-semibold text-slate-500">{t('form.course_unit')}</Label>
                                    <div className="flex gap-2">
                                        <Select value={currentData.course} onValueChange={(v) => handleChange('course', v)}>
                                            <SelectTrigger className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors h-10">
                                                <SelectValue placeholder={t('form.select_course')} />
                                            </SelectTrigger>
                                                <SelectContent>
                                                {courses.map(course => (
                                                    <SelectItem key={course.id} value={course.id}>
                                                        {course.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={currentData.unit} onValueChange={(v) => handleChange('unit', v)}>
                                            <SelectTrigger className="flex-[1.5] bg-slate-50 border-slate-200 focus:bg-white transition-colors h-10">
                                                <SelectValue placeholder={t('form.select_unit')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(courseDetails?.units ?? []).map(unit => (
                                                    <SelectItem key={unit.id} value={unit.id}>
                                                        {unit.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <div className="flex gap-4">
                                        <div className="flex-[1.5] space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500">{t('form.groups')}</Label>
                                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCombobox}
                                                        className="w-full justify-between h-10 border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-normal px-3"
                                                    >
                                                        {currentData.yearGroups.length > 0
                                                            ? `${currentData.yearGroups.length} selected`
                                                            : t('form.select_groups')}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Search group..." />
                                                        <CommandList>
                                                            <CommandEmpty>No group found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {availableClasses.map((group) => (
                                                                    <CommandItem
                                                                        key={group.id}
                                                                        value={group.name}
                                                                        onSelect={() => setCurrentData(prev => ({
                                                                            ...prev,
                                                                            yearGroups: [group.id],
                                                                            originalRoom: '',
                                                                            originalTime: '',
                                                                        }))}
                                                                    >
                                                                        <div className={cn(
                                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                            currentData.yearGroups.includes(group.id)
                                                                                ? "bg-primary text-primary-foreground"
                                                                                : "opacity-50 [&_svg]:invisible"
                                                                        )}>
                                                                            <Check className={cn("h-4 w-4")} />
                                                                        </div>
                                                                        <span>{group.name}</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            
                                            {/* Selected Tags */}
                                            {currentData.yearGroups.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {currentData.yearGroups.map(groupId => {
                                                        const group = availableClasses.find(item => item.id === groupId);
                                                        return (
                                                        <Badge key={groupId} variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 font-normal text-[10px] pl-2 pr-1 h-5 flex items-center gap-1">
                                                            {group?.name ?? groupId}
                                                            <span 
                                                                className="cursor-pointer hover:bg-slate-200 rounded-full p-0.5"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentData(prev => ({ ...prev, yearGroups: [] }));
                                                                }}
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </span>
                                                        </Badge>
                                                    )})}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500">{t('form.component')}</Label>
                                            <Select value={currentData.componentType} onValueChange={(v) => handleChange('componentType', v)}>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-10">
                                                    <SelectValue placeholder={t('form.select_type')} />
                                                </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All / Standard</SelectItem>
                                                <SelectItem value="theoretical">Theoretical</SelectItem>
                                                <SelectItem value="practical">Practical / Lab</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 sm:col-span-2">
                                     <Label className="text-xs font-semibold text-slate-500">{t('requests.reason')}</Label>
                                     <Input 
                                        placeholder={t('form.reason_placeholder')}
                                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        value={currentData.reason}
                                        onChange={(e) => handleChange('reason', e.target.value)}
                                     />
                                </div>
                            </div>

                            <Separator />

                            {/* Schedule */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                                {/* Arrow Connector */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-400 z-10">
                                    <ArrowRight className="w-4 h-4" />
                                </div>

                                {/* From */}
                                <div className="space-y-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                    <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">{t('form.original')}</Badge>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Input 
                                                type="date" 
                                                className="bg-white h-9 pr-10 cursor-pointer" 
                                                value={currentData.originalDate} 
                                                onChange={(e) => handleChange('originalDate', e.target.value)}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                            </div>
                                        </div>
                                        <Input type="text" className="bg-white h-9" value={selectedSchedule ? `${selectedSchedule.startTime.slice(0, 5)} - ${selectedSchedule.endTime.slice(0, 5)}` : ''} readOnly />
                                        <Select value={currentData.originalRoom} onValueChange={(v) => {
                                            const schedule = availableSchedules.find(item => item.id === v);
                                            setCurrentData(prev => ({
                                                ...prev,
                                                originalRoom: v,
                                                originalTime: schedule ? `${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)}` : '',
                                            }));
                                        }}>
                                            <SelectTrigger className="bg-white h-9">
                                                <SelectValue placeholder="Original schedule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSchedules.map(schedule => (
                                                    <SelectItem key={schedule.id} value={schedule.id}>
                                                        {getScheduleLabel(schedule)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* To */}
                                <div className="space-y-3 p-3 rounded-xl bg-blue-50/30 border border-blue-100">
                                    <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">{t('form.new_schedule')}</Badge>
                                    <div className="space-y-2">
                                        <Input type="date" className="bg-white h-9 border-blue-200" value={currentData.newDate} onChange={(e) => handleChange('newDate', e.target.value)} />
                                        <Input type="time" className="bg-white h-9 border-blue-200" value={currentData.newTime} onChange={(e) => handleChange('newTime', e.target.value)} />
                                        <Select value={currentData.newRoom} onValueChange={(v) => handleChange('newRoom', v)}>
                                            <SelectTrigger className="bg-white h-9 border-blue-200">
                                                <SelectValue placeholder={t('form.new_room')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classrooms.map(room => (
                                                    <SelectItem key={room.id} value={room.id}>
                                                        {room.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                             {/* Conflict Warning */}
                            {conflictWarning && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                                    <span className="font-medium">{conflictMessage || t('form.conflict_detected').replace('{room}', 'selected room')}</span>
                                </div>
                            )}

                            {!isEditMode && (
                                <Button 
                                    className="w-full bg-slate-900 text-white hover:bg-slate-800" 
                                    onClick={handleAddToQueue}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('form.add_queue')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>

        <SheetFooter className="p-6 border-t border-slate-200 bg-white">
          <Button 
             variant="ghost" 
             onClick={() => onOpenChange(false)} 
             className="mr-auto text-slate-500"
          >
            {t('common.cancel')}
          </Button>
          
          <Button 
             onClick={handleSubmit}
             className={cn(
                 "w-full sm:w-auto px-8 transition-all shadow-lg",
                 (queue.length > 0 || (currentData.course && currentData.newDate)) 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                    : "bg-slate-200 text-slate-400 pointer-events-none"
             )}
          >
             {isEditMode 
                ? t('form.submit_one')
                : t('form.submit_all').replace('{count}', queue.length + (currentData.course && currentData.newDate ? 1 : 0))}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
