import React, { useCallback, useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Plus, 
  Clock, 
  MapPin, 
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { cn } from '../../components/ui/utils';
import type { ClassRequest } from '../../types/requests';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { RequestDetailsPage } from '../../components/domain/requests/RequestDetailsPage';
import { RequestForm } from '../../components/domain/requests/RequestForm';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../../providers/LanguageContext';
import { listCompensationRequests, createCompensationRequest } from '../../services/compensationRequests/compensationRequestsApi';
import type { CompensationRequest } from '../../services/compensationRequests/compensationRequestTypes';
import { listCourses, getCourseDetails } from '../../services/courses/coursesApi';
import type { Course, CourseDetails, ClassSchedule } from '../../services/courses/courseTypes';
import { listClassrooms } from '../../services/classrooms/classroomsApi';
import type { Classroom } from '../../services/classrooms/classroomTypes';
import type { AuthenticatedUser } from '../../types/user';
import { getErrorMessage } from '../../utils/errors';

type CalendarMode = 'requests' | 'timetable' | 'occupancy';
type ViewType = 'month' | 'week' | 'day';

interface CalendarPageProps {
  userRole?: 'teacher' | 'coordinator' | 'admin';
  user: AuthenticatedUser;
}

type CalendarTimetableEvent = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  unit: string;
  room: string;
  roomId: string;
  roomType?: string;
  course: string;
  yearGroup: string;
  classGroup: string;
};

type CalendarHoliday = {
  date: string;
  name: string;
};

const holidays: CalendarHoliday[] = [];

const toClassRequest = (request: CompensationRequest): ClassRequest => ({
  id: request.id,
  course: request.course,
  unit: request.curricularUnit,
  yearGroups: request.yearGroups,
  componentType: request.componentType.toLowerCase() as ClassRequest['componentType'],
  originalDate: request.originalDate,
  originalTime: `${request.originalStartTime.slice(0, 5)} - ${request.originalEndTime.slice(0, 5)}`,
  originalRoom: request.originalRoom,
  newDate: request.newDate,
  newTime: `${request.newStartTime.slice(0, 5)} - ${request.newEndTime.slice(0, 5)}`,
  newRoom: request.newRoom,
  reason: request.justification,
  status: request.status.toLowerCase() as ClassRequest['status'],
  teacherName: request.teacherName,
  submittedAt: request.submittedAt.split('T')[0],
  hasConflict: request.hasConflict,
  rejectionReason: request.decisionComment ?? undefined,
  comments: [],
});

const toTimetableEvents = (
  course: Course,
  details: CourseDetails,
  classrooms: Classroom[],
): CalendarTimetableEvent[] => {
  const toEvent = (schedule: ClassSchedule): CalendarTimetableEvent => {
    const unit = details.units.find(item => item.id === schedule.curricularUnitId);
    const classGroup = details.classes.find(item => item.id === schedule.classGroupId);
    const room = classrooms.find(item => item.id === schedule.classroomId);

    return {
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.slice(0, 5),
      endTime: schedule.endTime.slice(0, 5),
      unit: unit?.name ?? schedule.curricularUnitId,
      room: room?.name ?? schedule.classroomId,
      roomId: schedule.classroomId,
      roomType: room?.type,
      course: course.name,
      yearGroup: unit ? `Year ${unit.year}` : 'Year',
      classGroup: classGroup?.name ?? schedule.classGroupId,
    };
  };

  return details.schedules.map(toEvent);
};

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

export const CalendarPage = ({ userRole = 'teacher', user }: CalendarPageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('requests');
  const { t } = useLanguage();
  
  // Filters
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // For Requests mode
  const [filterYearGroup, setFilterYearGroup] = useState('all'); // For Timetable mode
  const [filterClassGroup, setFilterClassGroup] = useState('all'); // For Timetable mode (New)
  const [filterRoom, setFilterRoom] = useState('all'); // For Occupancy mode
  const [filterRoomType, setFilterRoomType] = useState('all'); // For Occupancy mode
  
  // Modal States
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<ClassRequest | null>(null);
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timetableEvents, setTimetableEvents] = useState<CalendarTimetableEvent[]>([]);
  
  // Navigation State for Details
  const [showFullDetails, setShowFullDetails] = useState(false);

  const isAdmin = userRole === 'admin';

  const loadCalendarData = useCallback(async () => {
    try {
      const [loadedClassrooms, loadedCourses, loadedRequests] = await Promise.all([
        listClassrooms(),
        listCourses(),
        listCompensationRequests(undefined, userRole === 'teacher' ? user.id : undefined),
      ]);

      const activeCourses = loadedCourses.filter(course => course.isActive);
      const details = await Promise.all(activeCourses.map(course => getCourseDetails(course.id)));

      setClassrooms(loadedClassrooms.filter(room => room.isActive));
      setCourses(activeCourses);
      setRequests(loadedRequests.map(toClassRequest));
      setTimetableEvents(details.flatMap((detail, index) => detail ? toTimetableEvents(activeCourses[index], detail, loadedClassrooms) : []));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load calendar data.'));
    }
  }, [user.id, userRole]);

  useEffect(() => {
    void loadCalendarData();
  }, [loadCalendarData]);

  // --- Helpers ---

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const firstDayOfWeek = firstDay.getDay(); 
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const getWeekDays = (date: Date) => {
      const current = new Date(date);
      const day = current.getDay();
      const diff = current.getDate() - day; // Adjust to Sunday
      const startOfWeek = new Date(current.setDate(diff));
      const days = [];
      for(let i=0; i<7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          days.push(d);
      }
      return days;
  };

  const isHoliday = (date: Date) => !!holidays.find(h => h.date === formatDate(date));
  const getHoliday = (date: Date) => holidays.find(h => h.date === formatDate(date));
  const toIsoDayOfWeek = (date: Date) => {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  };

  // --- Data Fetching ---

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    
    if (calendarMode === 'requests') {
        return requests.filter(req => {
            const matchesDate = req.newDate === dateStr;
            const matchesCourse = filterCourse === 'all' || req.course === filterCourse;
            const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
            return matchesDate && matchesCourse && matchesStatus;
        });
    } else if (calendarMode === 'timetable') {
        const dayOfWeek = toIsoDayOfWeek(date);
        return timetableEvents.filter(slot => {
            const matchesDay = slot.dayOfWeek === dayOfWeek;
            
            // Strict filtering for Timetables as requested
            // Must match Course AND Year AND Class (if selected)
            // If filters are 'all', we show everything (or could force selection, but 'all' is safer for UX start)
            
            const matchesCourse = filterCourse === 'all' || slot.course === filterCourse;
            const matchesYear = filterYearGroup === 'all' || slot.yearGroup === filterYearGroup;
            const matchesClass = filterClassGroup === 'all' || slot.classGroup === filterClassGroup;

            return matchesDay && matchesCourse && matchesYear && matchesClass;
        }).map(slot => ({
            ...slot,
            // Adapt to generic event structure for rendering
            id: `tt-${slot.id}-${dateStr}`,
            newTime: slot.startTime,
            endTime: slot.endTime,
            teacherName: 'Regular Class',
            status: 'approved' // Timetables are always "approved"
        }));
    } else if (calendarMode === 'occupancy') {
        // If no room selected, return nothing or maybe everything? Let's require a room or type
        if (filterRoom === 'all' && filterRoomType === 'all') return [];

        const dayOfWeek = toIsoDayOfWeek(date);
        
        // 1. Get Timetable Events for this room(s)
        const occupiedTimetableEvents = timetableEvents.filter(slot => {
            const roomMatches = filterRoom === 'all' || slot.roomId === filterRoom;
            // Find room details to check type
            const typeMatches = filterRoomType === 'all' || slot.roomType === filterRoomType;
            
            return slot.dayOfWeek === dayOfWeek && roomMatches && typeMatches;
        }).map(slot => ({
            ...slot,
            id: `occ-tt-${slot.id}-${dateStr}`,
            newTime: slot.startTime,
            endTime: slot.endTime,
            teacherName: 'Occupied',
            status: 'occupied-class', // Special status for styling
            isOccupancy: true
        }));

        // 2. Get Requests for this room(s)
        const requestEvents = requests.filter(req => {
            const roomDetails = classrooms.find(room => room.name === req.newRoom || room.id === req.newRoom);
            const roomMatches = filterRoom === 'all' || roomDetails?.id === filterRoom;
            const typeMatches = filterRoomType === 'all' || (roomDetails && roomDetails.type === filterRoomType);
            
            return req.newDate === dateStr && roomMatches && typeMatches && req.status !== 'rejected';
        }).map(req => ({
             ...req,
             status: req.status === 'approved' ? 'occupied-request' : 'pending-request',
             isOccupancy: true
        }));

        return [...occupiedTimetableEvents, ...requestEvents];
    }
    return [];
  };

  // --- Handlers ---

  const handlePrev = () => {
      const newDate = new Date(currentDate);
      if (viewType === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (viewType === 'week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
  };

  const handleNext = () => {
      const newDate = new Date(currentDate);
      if (viewType === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (viewType === 'week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
  };

  const handleSlotClick = (date: Date, time?: string) => {
    if (isAdmin) {
        // Admins can view but not create requests via click (or maybe they can?) 
        // User says "admin can not add new request". So we should block this.
        return;
    }
    
    if (isHoliday(date)) {
        toast.error("Cannot schedule on holidays.");
        return;
    }
    
    setSelectedDate(date);
    setSelectedTime(time);
    setIsSheetOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    if (calendarMode === 'timetable') {
        // Show simplified info for timetable
        toast.info(`Timetable: ${event.unit} (${event.startTime} - ${event.endTime})`);
        return;
    }
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleCreateRequest = async (dataArray: any[]) => {
      try {
        const createdRequests = await Promise.all(dataArray.map((data: any) => createCompensationRequest({
          teacherUserId: user.id,
          teacherName: user.name,
          academicYearId: data.academicYearId,
          courseId: data.course,
          curricularUnitId: data.unit,
          classGroupId: data.yearGroups[0],
          originalClassScheduleId: data.originalRoom,
          newClassroomId: data.newRoom,
          originalDate: data.originalDate,
          newDate: data.newDate,
          newStartTime: data.newTime,
          newEndTime: addDuration(data.newTime, data.originalTime),
          justification: data.reason,
        })));

        setRequests(prev => [...createdRequests.filter(Boolean).map(request => toClassRequest(request!)), ...prev]);
        toast.success("Compensation request created successfully!");
      } catch (error) {
        toast.error(getErrorMessage(error, 'Unable to create compensation request.'));
      }
  };

  const navigateToDetails = () => {
      setIsEventModalOpen(false);
      setShowFullDetails(true);
  };

  // --- Sub-Components ---

  const renderMonthCell = (date: Date | null, idx: number) => {
      if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-r border-slate-100 dark:border-slate-800/50 min-h-[120px]" />;
      
      const dayEvents = getEventsForDate(date);
      const isDayHoliday = isHoliday(date);
      const holidayInfo = getHoliday(date);
      const isToday = formatDate(date) === formatDate(new Date());

      return (
          <div 
            key={date.toISOString()}
            onClick={() => handleSlotClick(date)}
            className={cn(
                "min-h-[120px] p-2 border-b border-r border-slate-100 dark:border-slate-800 transition-colors relative group",
                isDayHoliday 
                    ? "bg-slate-50 dark:bg-slate-950/50 cursor-not-allowed pattern-diagonal-lines pattern-slate-100 pattern-bg-white pattern-size-2 pattern-opacity-20" 
                    : isAdmin ? "bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            )}
          >
              <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
                      isToday 
                        ? "bg-blue-600 text-white" 
                        : isDayHoliday ? "text-slate-400" : "text-slate-700 dark:text-slate-300"
                  )}>
                      {date.getDate()}
                  </span>
                  {isDayHoliday && (
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger>
                                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50">
                                      Holiday
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>{holidayInfo?.name}</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  )}
              </div>

              <div className="space-y-1.5 mt-2">
                  {dayEvents.slice(0, 4).map((event: any) => (
                      <div 
                        key={event.id}
                        onClick={(e) => handleEventClick(e, event)}
                        className={cn(
                            "px-2 py-1 rounded text-[10px] font-medium border truncate shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                            event.status === 'approved' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" :
                            event.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300" :
                            event.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300" :
                            // Occupancy styles
                            event.status === 'occupied-class' ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" :
                            event.status === 'occupied-request' ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                          <div className="flex items-center gap-1">
                              <span className="font-bold">{event.newTime}</span>
                              <span className="truncate flex-1">{event.unit}</span>
                          </div>
                      </div>
                  ))}
                  {dayEvents.length > 4 && (
                      <div className="text-[10px] text-slate-400 pl-1 font-medium">
                          + {dayEvents.length - 4} more
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderTimeGrid = (days: Date[]) => {
      const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

      return (
          <div className="flex flex-col h-full min-h-[600px] overflow-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
             {/* Header */}
             <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50" />
                {days.map(day => {
                    const isToday = formatDate(day) === formatDate(new Date());
                    const isDayHoliday = isHoliday(day);
                    return (
                        <div key={day.toISOString()} className={cn("flex-1 py-3 text-center border-r border-slate-100 dark:border-slate-800", isDayHoliday && "bg-slate-50 dark:bg-slate-950/30")}>
                            <div className="text-xs font-semibold text-slate-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className={cn(
                                "text-lg font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full mx-auto",
                                isToday ? "bg-blue-600 text-white" : "text-slate-900 dark:text-slate-100"
                            )}>
                                {day.getDate()}
                            </div>
                            {isDayHoliday && <span className="text-[10px] text-amber-600 font-medium block mt-1">Holiday</span>}
                        </div>
                    );
                })}
             </div>

             {/* Grid */}
             <div className="flex-1 relative">
                {/* Time Labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 z-10">
                    {hours.map(hour => (
                        <div key={hour} className="h-20 text-xs text-slate-400 text-right pr-2 pt-2 border-b border-slate-100 dark:border-slate-800 relative">
                            {hour}:00
                            <div className="absolute top-0 right-0 w-2 h-[1px] bg-slate-300 dark:bg-slate-700" />
                        </div>
                    ))}
                </div>

                {/* Columns */}
                <div className="ml-16 flex h-[1040px]"> {/* 13 hours * 80px */}
                    {days.map(day => {
                        const dayEvents = getEventsForDate(day);
                        const isDayHoliday = isHoliday(day);

                        return (
                            <div key={day.toISOString()} className={cn("flex-1 border-r border-slate-100 dark:border-slate-800 relative", isDayHoliday && "bg-diagonal-stripes opacity-50")}>
                                {/* Grid Lines */}
                                {hours.map(hour => (
                                    <div 
                                        key={hour} 
                                        className="h-20 border-b border-slate-50 dark:border-slate-800/50 box-border hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                        onClick={() => handleSlotClick(day, `${hour}:00`)}
                                    />
                                ))}

                                {/* Events Positioning */}
                                {dayEvents.map((event: any) => {
                                    // Handle "HH:MM - HH:MM" format in newTime (from Requests) vs "HH:MM" (from Timetable)
                                    let startTimeStr = event.newTime;
                                    let endTimeStr = event.endTime;

                                    if (startTimeStr && startTimeStr.includes(' - ')) {
                                        const parts = startTimeStr.split(' - ');
                                        startTimeStr = parts[0];
                                        if (!endTimeStr) {
                                            endTimeStr = parts[1];
                                        }
                                    }

                                    // Parse Start Time
                                    const [h, m] = startTimeStr.split(':').map(Number);
                                    if (isNaN(h)) return null; // Safety check

                                    const startTotalMinutes = (h - 8) * 60 + (m || 0);
                                    const top = (startTotalMinutes / 60) * 80; // 80px per hour
                                    
                                    // Parse End Time
                                    let endTotalMinutes;
                                    if (endTimeStr) {
                                        const [endH, endM] = endTimeStr.split(':').map(Number);
                                        endTotalMinutes = (endH - 8) * 60 + (endM || 0);
                                    } else {
                                        endTotalMinutes = startTotalMinutes + 120; // Default 2 hours
                                    }
                                    
                                    const durationMinutes = endTotalMinutes - startTotalMinutes;
                                    const height = (durationMinutes / 60) * 80;

                                    return (
                                        <div 
                                            key={event.id}
                                            className={cn(
                                                "absolute inset-x-1 rounded-md p-2 text-xs border shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all z-10 overflow-hidden",
                                                event.status === 'approved' ? "bg-green-100/90 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200" :
                                                event.status === 'rejected' ? "bg-red-100/90 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200" :
                                                event.status === 'pending' ? "bg-amber-100/90 border-amber-200 text-amber-800 dark:bg-amber-900/50 dark:border-amber-800 dark:text-amber-200" :
                                                // Occupancy styles
                                                event.status === 'occupied-class' ? "bg-slate-200/90 border-slate-300 text-slate-800 dark:bg-slate-700/80 dark:border-slate-600 dark:text-slate-200" :
                                                event.status === 'occupied-request' ? "bg-purple-100/90 border-purple-200 text-purple-800 dark:bg-purple-900/50 dark:border-purple-800 dark:text-purple-200" :
                                                "bg-amber-100/90 border-amber-200 text-amber-800"
                                            )}
                                            style={{ top: `${top}px`, height: `${height}px` }}
                                            onClick={(e) => handleEventClick(e, event)}
                                        >
                                            <div className="font-bold">{event.unit}</div>
                                            <div className="flex items-center gap-1 mt-1 opacity-80">
                                                <Clock className="w-3 h-3" />
                                                {event.newTime.includes(' - ') ? event.newTime : `${event.newTime} - ${event.endTime || `${h+2}:00`}`}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5 opacity-80">
                                                <MapPin className="w-3 h-3" />
                                                {event.newRoom || event.room}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>
      );
  };

  // --- Main Render ---

  if (showFullDetails && selectedEvent) {
      return (
          <RequestDetailsPage 
            request={selectedEvent}
            onBack={() => setShowFullDetails(false)}
            onAddComment={() => {}} 
            userRole={userRole}
          />
      );
  }

  const getCalendarModeDescription = () => {
      switch(calendarMode) {
          case 'requests': return t('calendar.manage_requests');
          case 'timetable': return t('calendar.view_timetable');
          case 'occupancy': return t('calendar.check_occupancy');
          default: return '';
      }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t('menu.calendar')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {getCalendarModeDescription()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
             {/* View Type Toggle */}
             <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex mr-2">
                <Button 
                    variant={viewType === 'month' ? 'white' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={() => setViewType('month')}
                >
                    {t('calendar.month')}
                </Button>
                <Button 
                    variant={viewType === 'week' ? 'white' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={() => setViewType('week')}
                >
                    {t('calendar.week')}
                </Button>
                <Button 
                    variant={viewType === 'day' ? 'white' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={() => setViewType('day')}
                >
                    {t('calendar.day')}
                </Button>
             </div>

             {/* Mode Select */}
             <Select value={calendarMode} onValueChange={(v: CalendarMode) => setCalendarMode(v)}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900 font-medium">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="requests">
                        <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> {t('calendar.mode_requests')}</span>
                    </SelectItem>
                    <SelectItem value="timetable">
                        <span className="flex items-center gap-2"><List className="w-4 h-4"/> {t('calendar.mode_timetables')}</span>
                    </SelectItem>
                    <SelectItem value="occupancy">
                        <span className="flex items-center gap-2"><Columns className="w-4 h-4"/> {t('calendar.mode_occupancy')}</span>
                    </SelectItem>
                </SelectContent>
             </Select>

             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

             {/* Navigation */}
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1 shadow-sm mr-2">
                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="min-w-[120px] text-center font-medium text-sm">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    {viewType === 'week' && ` (W${Math.ceil(currentDate.getDate() / 7)})`}
                    {viewType === 'day' && ` ${currentDate.getDate()}`}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
            
            {!isAdmin && (
              <Button onClick={() => {
                  setSelectedDate(new Date());
                  setIsSheetOpen(true);
              }} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                  <Plus className="w-4 h-4 mr-2" /> {t('calendar.new_request')}
              </Button>
            )}
        </div>
      </div>

      {/* Filters Toolbar - Dynamic based on Mode */}
      <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2">
          <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200 h-8 px-3 flex items-center gap-2">
              <Filter className="w-3 h-3" /> {t('calendar.filters')}:
          </Badge>

          <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="h-8 min-w-[140px] text-xs bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('requests.all_courses')}</SelectItem>
                    {courses.map(course => (
                        <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

          {calendarMode === 'requests' && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 min-w-[140px] text-xs bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>
          )}

          {calendarMode === 'timetable' && (
             <>
                <Select value={filterYearGroup} onValueChange={setFilterYearGroup}>
                    <SelectTrigger className="h-8 min-w-[140px] text-xs bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Year Group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                         {Array.from(new Set(timetableEvents.map(event => event.yearGroup))).map(yearGroup => (
                             <SelectItem key={yearGroup} value={yearGroup}>{yearGroup}</SelectItem>
                         ))}
                    </SelectContent>
                </Select>
                 <Select value={filterClassGroup} onValueChange={setFilterClassGroup}>
                     <SelectTrigger className="h-8 min-w-[140px] text-xs bg-white dark:bg-slate-900">
                         <SelectValue placeholder="Class Group" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All Classes</SelectItem>
                         {Array.from(new Set(timetableEvents.map(event => event.classGroup))).map(classGroup => (
                             <SelectItem key={classGroup} value={classGroup}>{classGroup}</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
             </>
          )}

          {calendarMode === 'occupancy' && (
             <>
                 <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                     <SelectTrigger className="h-8 min-w-[140px] text-xs bg-white dark:bg-slate-900">
                         <SelectValue placeholder="Room Type" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All Types</SelectItem>
                         {Array.from(new Set(classrooms.map(room => room.type))).map(type => (
                             <SelectItem key={type} value={type}>{type}</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>

                 <Select value={filterRoom} onValueChange={setFilterRoom}>
                     <SelectTrigger className="h-8 min-w-[140px] text-xs bg-white dark:bg-slate-900">
                         <SelectValue placeholder="Select Room" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All Rooms</SelectItem>
                         {classrooms.map(room => (
                             <SelectItem key={room.id} value={room.id}>{room.name} ({room.capacity})</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
             </>
          )}
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {viewType === 'month' ? (
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
        ) : null}

        {viewType === 'month' ? (
            <div className="grid grid-cols-7 auto-rows-fr">
                {getDaysInMonth(currentDate).map((date, idx) => renderMonthCell(date, idx))}
            </div>
        ) : viewType === 'week' ? (
            renderTimeGrid(getWeekDays(currentDate))
        ) : (
            renderTimeGrid([currentDate])
        )}
      </div>
      
      <RequestForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleCreateRequest}
      />

    </div>
  );
};
