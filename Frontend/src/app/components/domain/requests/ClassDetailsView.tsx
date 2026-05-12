import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus, 
  User,
  Upload
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ClassGroup, CurricularUnit, TimeSlot } from '../../../types/academic';
import { AddScheduleModal } from '../../../pages/Courses/components/AddScheduleModal';
import { BulkImportSchedulesSheet } from '../../../pages/Courses/components/BulkImportSchedulesSheet';
import { toast } from 'sonner@2.0.3';
import type { PlatformUser } from '../../../services/users/userTypes';
import type { Classroom } from '../../../services/classrooms/classroomTypes';

interface ClassDetailsViewProps {
  classGroup: ClassGroup;
  unit: CurricularUnit;
  teacher?: PlatformUser;
  schedules: TimeSlot[];
  allClasses: ClassGroup[]; // needed for conflict check
  courseUnits: CurricularUnit[]; // added for modal
  classrooms: Classroom[];
  onBack: () => void;
  onAddSchedule: (data: Omit<TimeSlot, 'id'>) => void | Promise<void>;
  onUpdateSchedule: (id: string, data: Omit<TimeSlot, 'id'>) => void | Promise<void>;
  onDeleteSchedule: (id: string) => void | Promise<void>;
  userRole: 'coordinator' | 'teacher' | 'admin';
}

export const ClassDetailsView = ({
  classGroup,
  unit,
  teacher,
  schedules,
  allClasses,
  courseUnits,
  classrooms,
  onBack,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  userRole
}: ClassDetailsViewProps) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TimeSlot | undefined>(undefined);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const canManage = userRole === 'coordinator' || userRole === 'admin';
  const teacherName = teacher?.fullName || teacher?.email || '';

  const handleEditClick = (schedule: TimeSlot) => {
      setEditingSchedule(schedule);
      setIsScheduleModalOpen(true);
  };

  const handleAddClick = () => {
      setEditingSchedule(undefined);
      setIsScheduleModalOpen(true);
  };

  const handleBulkImport = (newSchedules: Omit<TimeSlot, 'id'>[]) => {
      // Apply the current class group and unit context to imported schedules to ensure they belong to this view
      const schedulesWithContext = newSchedules.map(schedule => ({
          ...schedule,
          classGroup: classGroup.name,
          unit: unit.name,
          course: unit.courseId
      }));
      
      schedulesWithContext.forEach(schedule => {
          onAddSchedule(schedule);
      });
      
      toast.success(`Successfully imported ${newSchedules.length} schedule slots for ${classGroup.name}`);
  };

  const handleSaveSchedule = (data: Omit<TimeSlot, 'id'>) => {
      if (editingSchedule) {
          onUpdateSchedule(editingSchedule.id, data);
      } else {
          onAddSchedule(data);
      }
      setIsScheduleModalOpen(false);
  };

  const getDayName = (day: number) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[day] || 'Unknown';
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <AddScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        classGroup={classGroup}
        unit={unit}
        courseUnits={courseUnits}
        existingTimetable={schedules} 
        allClasses={allClasses}
        initialData={editingSchedule}
        classrooms={classrooms}
      />
      
      <BulkImportSchedulesSheet 
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
          onImport={handleBulkImport}
          courseName={unit.courseId.toUpperCase()}
      />

      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="pl-0 gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4" /> Back to Course
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-sm font-medium text-slate-500">Class Details</span>
      </div>

      {/* Class Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                  <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                          {unit.courseId.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-700">
                          Semester {unit.semester}
                      </Badge>
                      <Badge variant="outline" className="text-slate-500 border-slate-200 dark:border-slate-700">
                          2023/24
                      </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {classGroup.name}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Curricular Unit
                  </p>
              </div>

              {teacher && (
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Avatar className="w-12 h-12 border border-white dark:border-slate-700 shadow-sm">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=random`} />
                          <AvatarFallback>{teacherName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Teacher</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{teacherName}</p>
                          <p className="text-xs text-slate-500">{teacher.email}</p>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Weekly Schedule
              </h2>
              {canManage && (
                  <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="gap-2">
                          <Upload className="w-4 h-4" /> Bulk Import
                      </Button>
                      <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                          <Plus className="w-4 h-4 mr-2" /> Add Schedule Slot
                      </Button>
                  </div>
              )}
          </div>

          {/* Filter schedules for THIS class group only */}
          {schedules.filter(s => s.classGroup === classGroup.name && s.unit === unit.name).length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No schedule configured</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      This class group does not have any weekly slots assigned yet.
                  </p>
                  {canManage && (
                      <div className="flex justify-center gap-3 mt-2">
                          <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="gap-2">
                              <Upload className="w-4 h-4" /> Bulk Import
                          </Button>
                          <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white">
                              Configure Schedule
                          </Button>
                      </div>
                  )}
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedules
                      .filter(s => s.classGroup === classGroup.name && s.unit === unit.name)
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || parseInt(a.startTime) - parseInt(b.startTime))
                      .map((slot) => (
                      <Card key={slot.id} className="hover:shadow-md transition-all border-slate-200 dark:border-slate-800 group">
                          <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                              <div>
                                  <Badge variant={slot.type === 'theoretical' ? 'default' : 'secondary'} className={
                                      slot.type === 'theoretical' 
                                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 mb-2"
                                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 mb-2"
                                  }>
                                      {slot.type}
                                  </Badge>
                                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                      {getDayName(slot.dayOfWeek)}
                                  </CardTitle>
                              </div>
                              {canManage && (
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <MoreVertical className="w-4 h-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => handleEditClick(slot)}>
                                              <Edit className="w-4 h-4 mr-2" /> Edit Slot
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-600" onClick={() => onDeleteSchedule(slot.id)}>
                                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              )}
                          </CardHeader>
                          <CardContent>
                              <div className="space-y-3">
                                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                      <Clock className="w-4 h-4 text-slate-400" />
                                      <span className="font-medium text-slate-900 dark:text-slate-200">
                                          {slot.startTime} - {slot.endTime}
                                      </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                      <MapPin className="w-4 h-4 text-slate-400" />
                                      <span>{slot.room}</span>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};
