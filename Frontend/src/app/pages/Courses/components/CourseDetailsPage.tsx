import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  CalendarRange, 
  BookOpen, 
  GraduationCap, 
  MoreHorizontal, 
  Plus, 
  Users, 
  Layers,
  Search,
  BookCopy,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  UserPlus,
  Briefcase,
  Calendar,
  Upload
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Separator } from '../../../components/ui/separator';
import { mockCourses, mockTeachers, mockTimetable, Course as MockCourse, CurricularUnit, ClassGroup, TimeSlot } from '../../../mocks/data';
import { cn } from '../../../components/ui/utils';
import { toast } from 'sonner@2.0.3';
import { AddCurricularUnitModal } from './AddCurricularUnitModal';
import { AddClassModal } from './AddClassModal';
import { AssignTeachersModal } from './AssignTeachersModal';
import { AssignTeacherToCourseModal } from './AssignTeacherToCourseModal';
import { ClassDetailsView } from '../../../components/domain/requests/ClassDetailsView';
import { BulkImportSchedulesSheet } from './BulkImportSchedulesSheet';
import { getCourseDetails } from '../../../services/courses/coursesApi';
import type { Course as ApiCourse, ClassGroup as ApiClassGroup, CurricularUnit as ApiCurricularUnit } from '../../../services/courses/courseTypes';

interface CourseDetailsPageProps {
  courseId: string;
  course?: ApiCourse;
  userRole: 'coordinator' | 'teacher' | 'admin';
  userId: string; 
  onBack: () => void;
}

const toDetailsCourse = (course: ApiCourse): MockCourse => ({
  id: course.id,
  name: course.name,
  abbreviation: course.abbreviation,
  description: course.description,
  type: course.type,
  durationYears: course.durationYears,
  totalCredits: course.totalCredits,
  coordinatorId: course.coordinatorUserId ?? '',
  image: course.imageUrl,
});

const toDetailsUnit = (unit: ApiCurricularUnit): CurricularUnit => ({
  id: unit.id,
  name: unit.name,
  courseId: unit.courseId,
  year: unit.year,
  semester: unit.semester,
  ects: unit.ects,
  teacherIds: unit.teacherIds,
  regentId: unit.regentId ?? undefined,
  theoreticalTeacherId: unit.theoreticalTeacherId ?? undefined,
  practicalTeacherId: unit.practicalTeacherId ?? undefined,
  component: unit.component,
});

const toDetailsClassGroup = (group: ApiClassGroup): ClassGroup => ({
  id: group.id,
  name: group.name,
  unitId: group.curricularUnitId,
  teacherId: group.teacherId,
});

export const CourseDetailsPage = ({ courseId, course: apiCourse, userRole, userId, onBack }: CourseDetailsPageProps) => {
  const [course, setCourse] = useState<MockCourse | undefined>(
    apiCourse ? toDetailsCourse(apiCourse) : mockCourses.find(c => c.id === courseId)
  );
  
  const [localUnits, setLocalUnits] = useState<CurricularUnit[]>([]);
  const [localClasses, setLocalClasses] = useState<ClassGroup[]>([]);
  const [localTimetable, setLocalTimetable] = useState<TimeSlot[]>(mockTimetable);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
  const [isAddTeacherToCourseModalOpen, setIsAddTeacherToCourseModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  
  const [editingUnit, setEditingUnit] = useState<CurricularUnit | undefined>(undefined);
  const [assigningUnit, setAssigningUnit] = useState<CurricularUnit | undefined>(undefined);
  
  // Navigation State
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  
  const [selectedYear, setSelectedYear] = useState<number>(1);

  useEffect(() => {
      let isMounted = true;

      const loadDetails = async () => {
          try {
              setIsLoadingDetails(true);
              const details = await getCourseDetails(courseId);

              if (!isMounted || !details) {
                  return;
              }

              setCourse(toDetailsCourse(details.course));
              setLocalUnits(details.units.map(toDetailsUnit));
              setLocalClasses(details.classes.map(toDetailsClassGroup));
          } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to load course details.");
          } finally {
              if (isMounted) {
                  setIsLoadingDetails(false);
              }
          }
      };

      loadDetails();

      return () => {
          isMounted = false;
      };
  }, [courseId]);

  if (isLoadingDetails && !course) {
      return (
          <div className="flex min-h-[360px] items-center justify-center text-slate-500">
              Loading course details...
          </div>
      );
  }

  if (!course) return <div>Course not found</div>;

  // --- Filter Logic ---

  // 1. Get Units for this course
  const courseUnits = localUnits.filter(u => u.courseId === courseId);
  
  // 2. Filter Units based on Role
  const visibleUnits = courseUnits.filter(unit => {
      if (userRole === 'coordinator' || userRole === 'admin') return true; 
      return unit.teacherIds.includes(userId);
  });

  // 3. Get Classes for visible units
  const visibleClasses = localClasses.filter(cls => {
      const unit = courseUnits.find(u => u.id === cls.unitId);
      if (!unit) return false;

      if (userRole === 'coordinator' || userRole === 'admin') return true;
      return cls.teacherId === userId;
  });

  // 4. Get Teachers involved in this course
  const courseTeacherIds = Array.from(new Set(courseUnits.flatMap(u => u.teacherIds)));
  const courseTeachers = mockTeachers.filter(t => courseTeacherIds.includes(t.id));

  // --- Handlers ---

  const handleAddUnitClick = (year: number) => {
      setSelectedYear(year);
      setEditingUnit(undefined);
      setIsUnitModalOpen(true);
  };

  const handleEditUnitClick = (unit: CurricularUnit) => {
      setSelectedYear(unit.year);
      setEditingUnit(unit);
      setIsUnitModalOpen(true);
  };

  const handleDeleteUnit = (unitId: string) => {
      setLocalUnits(prev => prev.filter(u => u.id !== unitId));
      toast.success("Curricular unit deleted");
  };

  const handleViewUnit = (unit: CurricularUnit) => {
      toast.info(`Viewing details for ${unit.name}`);
      // Future: Navigate to dedicated unit page
  };

  const handleAssignTeachersClick = (unit: CurricularUnit) => {
      setAssigningUnit(unit);
      setIsAssignTeacherModalOpen(true);
  };

  const handleSaveUnit = (unitData: Omit<CurricularUnit, 'id'>) => {
      if (editingUnit) {
          setLocalUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, ...unitData } : u));
      } else {
          const newUnit: CurricularUnit = {
              ...unitData,
              id: `new_u_${Date.now()}`,
              teacherIds: [] // Default empty
          };
          setLocalUnits(prev => [...prev, newUnit]);
      }
  };

  const handleSaveTeacherAssignment = (unitId: string, assignments: { regentId: string, theoreticalTeacherId?: string, practicalTeacherId?: string }) => {
      setLocalUnits(prev => prev.map(u => {
          if (u.id !== unitId) return u;
          
          // Calculate new teacherIds list (unique set)
          const newTeacherIds = new Set<string>();
          if (assignments.regentId) newTeacherIds.add(assignments.regentId);
          if (assignments.theoreticalTeacherId) newTeacherIds.add(assignments.theoreticalTeacherId);
          if (assignments.practicalTeacherId) newTeacherIds.add(assignments.practicalTeacherId);

          return {
              ...u,
              ...assignments,
              teacherIds: Array.from(newTeacherIds)
          };
      }));
  };

  const handleAddTeacherToCourse = (data: { teacherId: string, unitId: string, roles: { regent: boolean, theoretical: boolean, practical: boolean } }) => {
      setLocalUnits(prev => prev.map(u => {
          if (u.id !== data.unitId) return u;

          // Clone existing data
          const updated = { ...u };
          const newTeacherIds = new Set(updated.teacherIds);
          newTeacherIds.add(data.teacherId);

          if (data.roles.regent) updated.regentId = data.teacherId;
          if (data.roles.theoretical) updated.theoreticalTeacherId = data.teacherId;
          if (data.roles.practical) updated.practicalTeacherId = data.teacherId;

          updated.teacherIds = Array.from(newTeacherIds);
          return updated;
      }));
  };

  const handleAddClass = () => {
      setIsClassModalOpen(true);
  };
  
  const handleSaveClass = (classData: Omit<ClassGroup, 'id'>) => {
      const newClass: ClassGroup = {
          ...classData,
          id: `new_class_${Date.now()}`,
      };
      setLocalClasses(prev => [...prev, newClass]);
  };

  const handleBulkImportSchedules = (schedules: Omit<TimeSlot, 'id'>[]) => {
      const newSlots = schedules.map((slot, index) => ({
          ...slot,
          id: `bulk_slot_${Date.now()}_${index}`
      }));
      setLocalTimetable(prev => [...prev, ...newSlots]);
      toast.success(`Successfully imported ${newSlots.length} schedules.`);
  };

  // Schedule CRUD Handlers passed to ClassDetailsView
  const handleAddSchedule = (scheduleData: Omit<TimeSlot, 'id'>) => {
      const newSlot: TimeSlot = {
          ...scheduleData,
          id: `slot_${Date.now()}`,
      };
      setLocalTimetable(prev => [...prev, newSlot]);
      toast.success("Schedule added successfully!");
  };

  const handleUpdateSchedule = (id: string, scheduleData: Omit<TimeSlot, 'id'>) => {
      setLocalTimetable(prev => prev.map(slot => slot.id === id ? { ...slot, ...scheduleData } : slot));
      toast.success("Schedule updated successfully!");
  };

  const handleDeleteSchedule = (id: string) => {
      setLocalTimetable(prev => prev.filter(slot => slot.id !== id));
      toast.success("Schedule deleted successfully.");
  };

  // --- Render Logic ---

  if (selectedClass) {
      const unit = localUnits.find(u => u.id === selectedClass.unitId);
      const teacher = mockTeachers.find(t => t.id === selectedClass.teacherId);
      
      if (!unit) return <div>Unit not found error</div>;

      return (
          <ClassDetailsView 
              classGroup={selectedClass}
              unit={unit}
              teacher={teacher}
              schedules={localTimetable}
              allClasses={localClasses}
              onBack={() => setSelectedClass(null)}
              onAddSchedule={handleAddSchedule}
              onUpdateSchedule={handleUpdateSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              userRole={userRole}
          />
      );
  }

  const renderCurriculumByYear = () => {
      // Group by Year
      const unitsByYear = visibleUnits.reduce((acc, unit) => {
          if (!acc[unit.year]) acc[unit.year] = [];
          acc[unit.year].push(unit);
          return acc;
      }, {} as Record<number, CurricularUnit[]>);

      if (Object.keys(unitsByYear).length === 0) {
          return (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <BookCopy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No curricular units found for your profile in this course.</p>
                {(userRole === 'coordinator' || userRole === 'admin') && (
                    <Button variant="link" onClick={() => handleAddUnitClick(1)}>Add your first unit</Button>
                )}
            </div>
          );
      }

      // Ensure we display years in order
      const sortedYears = Object.keys(unitsByYear).map(Number).sort((a, b) => a - b);

      return (
          <Accordion type="multiple" defaultValue={sortedYears.map(y => `item-${y}`)} className="w-full space-y-4">
              {sortedYears.map((year) => (
                  <AccordionItem key={year} value={`item-${year}`} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 px-4 shadow-sm">
                      <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                                  {year}º
                              </div>
                              <span className="font-semibold text-lg text-slate-900 dark:text-slate-100">Year {year}</span>
                              <Badge variant="secondary" className="ml-2 font-normal text-slate-500 bg-slate-100 dark:bg-slate-800">
                                  {unitsByYear[year].length} Units
                              </Badge>
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                              {unitsByYear[year]
                                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(unit => {
                                  // Find Regent
                                  const regent = mockTeachers.find(t => t.id === unit.regentId);
                                  
                                  return (
                                  <div key={unit.id} className="group flex items-start justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                                      <div onClick={() => handleViewUnit(unit)} className="flex-1">
                                          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                              {unit.name}
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-slate-200 dark:border-slate-700">
                                                  {unit.ects} ECTS
                                              </Badge>
                                              <span className="flex items-center gap-1">
                                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                  S{unit.semester}
                                              </span>
                                              {regent && (
                                                  <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                                                      <Avatar className="w-4 h-4">
                                                          <AvatarImage src={regent.avatarUrl} />
                                                          <AvatarFallback>{regent.name[0]}</AvatarFallback>
                                                      </Avatar>
                                                      <span className="truncate max-w-[100px]">{regent.name}</span>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                      
                                      {/* Actions Menu */}
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <MoreVertical className="w-4 h-4" />
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                              <DropdownMenuItem onClick={() => handleViewUnit(unit)}>
                                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                              </DropdownMenuItem>
                                              {(userRole === 'coordinator' || userRole === 'admin') && (
                                                <>
                                                  <DropdownMenuItem onClick={() => handleAssignTeachersClick(unit)}>
                                                      <UserPlus className="w-4 h-4 mr-2" /> Assign Teachers
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => handleEditUnitClick(unit)}>
                                                      <Edit className="w-4 h-4 mr-2" /> Edit Unit
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem 
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDeleteUnit(unit.id)}
                                                  >
                                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                  </DropdownMenuItem>
                                                </>
                                              )}
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </div>
                                )})}
                          </div>
                          {(userRole === 'coordinator' || userRole === 'admin') && (
                              <Button variant="outline" size="sm" className="w-full mt-3 border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50" onClick={() => handleAddUnitClick(year)}>
                                  <Plus className="w-4 h-4 mr-2" /> Add Curricular Unit to Year {year}
                              </Button>
                          )}
                      </AccordionContent>
                  </AccordionItem>
              ))}
          </Accordion>
      );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AddCurricularUnitModal 
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onSave={handleSaveUnit}
        courseId={courseId}
        year={selectedYear}
        initialData={editingUnit}
      />
      
      <AddClassModal 
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        units={courseUnits}
      />

      <AssignTeachersModal 
        isOpen={isAssignTeacherModalOpen}
        onClose={() => setIsAssignTeacherModalOpen(false)}
        onSave={handleSaveTeacherAssignment}
        unit={assigningUnit}
      />

      <AssignTeacherToCourseModal 
        isOpen={isAddTeacherToCourseModalOpen}
        onClose={() => setIsAddTeacherToCourseModalOpen(false)}
        onSave={handleAddTeacherToCourse}
        courseUnits={courseUnits}
      />

      <BulkImportSchedulesSheet 
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImport={handleBulkImportSchedules}
        courseName={course.name}
      />

      {/* Navigation */}
      <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:pl-2 transition-all gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white mb-8 shadow-2xl shadow-slate-200 dark:shadow-none">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
              <img 
                src={course.image} 
                alt={course.name} 
                className="w-full h-full object-cover opacity-30 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
          </div>

          <div className="relative p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 max-w-3xl">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 text-sm font-semibold tracking-wide shadow-lg shadow-blue-900/20">
                            {course.abbreviation}
                        </Badge>
                        <Badge variant="outline" className="text-slate-300 border-slate-600 bg-slate-800/50 backdrop-blur-md">
                            {course.type}
                        </Badge>
                      </div>
                      
                      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                          {course.name}
                      </h1>
                      
                      <p className="text-slate-300 text-lg leading-relaxed font-light">
                          {course.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-6 pt-6 text-slate-300">
                          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
                              <CalendarRange className="w-4 h-4 text-blue-400" />
                              <span className="font-medium text-sm">{course.durationYears} Years</span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
                              <BookOpen className="w-4 h-4 text-blue-400" />
                              <span className="font-medium text-sm">{course.totalCredits} ECTS Credits</span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
                              <GraduationCap className="w-4 h-4 text-blue-400" />
                              <span className="font-medium text-sm">{course.type} Degree</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="curriculum" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-20 z-10 bg-slate-50 dark:bg-slate-950 py-2 -mx-2 px-2">
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 h-12 w-fit shadow-sm">
                <TabsTrigger value="curriculum" className="h-10 px-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 font-medium">
                    <Layers className="w-4 h-4 mr-2" /> Curriculum Plan
                </TabsTrigger>
                <TabsTrigger value="teachers" className="h-10 px-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 font-medium">
                    <Briefcase className="w-4 h-4 mr-2" /> Faculty
                </TabsTrigger>
                <TabsTrigger value="classes" className="h-10 px-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 font-medium">
                    <Users className="w-4 h-4 mr-2" /> Classes & Groups
                </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search units or classes..." 
                    className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <TabsContent value="curriculum" className="mt-0 min-h-[400px]">
             {renderCurriculumByYear()}
          </TabsContent>

          <TabsContent value="teachers" className="mt-0 min-h-[400px]">
             {/* Action Bar for Teachers Tab */}
             {(userRole === 'coordinator' || userRole === 'admin') && (
                 <div className="flex justify-end mb-4">
                     <Button 
                        onClick={() => setIsAddTeacherToCourseModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                     >
                         <UserPlus className="w-4 h-4 mr-2" /> Assign Teacher to Course
                     </Button>
                 </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {courseTeachers.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-400" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No faculty assigned</h3>
                        <p className="max-w-xs mx-auto mt-1 mb-4">
                            There are no teachers assigned to any curricular units in this course yet.
                        </p>
                        {(userRole === 'coordinator' || userRole === 'admin') && (
                            <Button onClick={() => setIsAddTeacherToCourseModalOpen(true)}>
                                Assign First Teacher
                            </Button>
                        )}
                    </div>
                 ) : (
                    courseTeachers.map(teacher => {
                        const unitsTaught = courseUnits.filter(u => u.teacherIds.includes(teacher.id));
                        return (
                            <Card key={teacher.id} className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="w-14 h-14 border border-slate-100">
                                        <AvatarImage src={teacher.avatarUrl} />
                                        <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{teacher.name}</CardTitle>
                                        <CardDescription>{teacher.email}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-slate-500">Teaching Units:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {unitsTaught.map(u => (
                                                <Badge key={u.id} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                                                    {u.name}
                                                    {u.regentId === teacher.id && <span className="ml-1 text-[10px] text-blue-600 font-bold">(R)</span>}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                 )}
             </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-0 min-h-[400px]">
             {/* Action Bar for Classes Tab */}
             {(userRole === 'coordinator' || userRole === 'admin') && (
                 <div className="flex justify-end gap-2 mb-4">
                     <Button 
                        onClick={() => setIsBulkImportOpen(true)}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-dashed"
                     >
                         <Upload className="w-4 h-4 mr-2" /> Import Schedule
                     </Button>
                     <Button 
                        onClick={handleAddClass}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                     >
                         <Plus className="w-4 h-4 mr-2" /> Add Class
                     </Button>
                 </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {visibleClasses.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-400" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No classes found</h3>
                        <p className="max-w-xs mx-auto mt-1 mb-4">
                            {userRole !== 'teacher' 
                                ? "There are no classes created for this course yet." 
                                : "You haven't been assigned to any classes in this course."}
                        </p>
                        {userRole !== 'teacher' && (
                             <Button onClick={handleAddClass} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Create First Class
                             </Button>
                        )}
                    </div>
                 ) : (
                    visibleClasses
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(cls => {
                             const unit = localUnits.find(u => u.id === cls.unitId);
                             const teacher = mockTeachers.find(t => t.id === cls.teacherId);
                             
                             // Count schedule items for this class
                             const scheduleCount = localTimetable.filter(t => t.classGroup === cls.name && t.unit === unit?.name).length;

                             return (
                                <Card key={cls.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200 dark:border-slate-800">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant='default' className={cn(
                                                "mb-2 capitalize bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300"
                                            )}>
                                                Class
                                            </Badge>
                                            
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-slate-400 hover:text-slate-600">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => {
                                                        if (unit) {
                                                            setSelectedClass(cls);
                                                        } else {
                                                            toast.error("Unit not found");
                                                        }
                                                    }}>
                                                        <Calendar className="w-4 h-4 mr-2" /> View Details & Schedule
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>View Students</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">Delete Class</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {cls.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1">
                                            Year {unit?.year || "?"} • Semester {unit?.semester || "?"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {teacher && (
                                            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={teacher.avatarUrl} />
                                                    <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                    {teacher.name}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span>{scheduleCount} Weekly Slots</span>
                                            <Button 
                                                variant="link" 
                                                className="h-auto p-0 text-blue-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (unit) setSelectedClass(cls);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                             );
                        })
                 )}
             </div>
          </TabsContent>
      </Tabs>
    </div>
  );
};
