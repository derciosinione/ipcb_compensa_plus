import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  MoreVertical, 
  Search, 
  Plus, 
  Settings2,
  Users,
  Briefcase
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { mockCourses, Course, mockUnits, User } from '../../mocks/data';
import { CourseDetailsPage } from './components/CourseDetailsPage';
import { cn } from '../../components/ui/utils';
import { AddCourseModal } from './components/AddCourseModal';
import { useLanguage } from '../../providers/LanguageContext';

interface CoursesPageProps {
  user: User;
}

export const CoursesPage = ({ user }: CoursesPageProps) => {
  // Use props instead of local state
  const userRole = user.role;
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  
  // Local state for courses to allow adding new ones
  const [localCourses, setLocalCourses] = useState<Course[]>(mockCourses);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);

  // Mock User IDs for the demo to ensure data visibility
  // If role is coordinator, we use the mock coordinator ID to show their courses
  // Otherwise we use the actual user ID
  const currentUserId = userRole === 'coordinator' ? 'user-coord-1' : user.id;

  // Filter Courses Logic
  const visibleCourses = localCourses.filter(course => {
      // 1. Text Search
      if (searchTerm && !course.name.toLowerCase().includes(searchTerm.toLowerCase()) && !course.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
      }

      // 2. Role Filter
      if (userRole === 'admin') {
          return true; // Admin sees all courses
      }
      
      if (userRole === 'coordinator') {
          // Show courses where user is coordinator
          return course.coordinatorId === currentUserId; 
      } else {
          // Show courses where teacher has ANY unit assigned
          // Check if any unit in this course lists the currentUserId as a teacher
          const teacherUnits = mockUnits.filter(u => u.teacherIds.includes(currentUserId) && u.courseId === course.id);
          return teacherUnits.length > 0;
      }
  });

  const handleAddCourse = () => {
      setIsAddCourseModalOpen(true);
  };

  const handleSaveCourse = (courseData: Omit<Course, 'id'>) => {
      const newCourse: Course = {
          ...courseData,
          id: `new_course_${Date.now()}`,
      };
      setLocalCourses(prev => [...prev, newCourse]);
  };

  if (selectedCourseId) {
      return (
          <CourseDetailsPage 
            courseId={selectedCourseId} 
            userRole={userRole}
            userId={currentUserId}
            onBack={() => setSelectedCourseId(null)} 
          />
      );
  }

  const getSubtitle = () => {
    if (userRole === 'admin') return t('courses.subtitle_admin');
    if (userRole === 'coordinator') return t('courses.subtitle_coordinator');
    return t('courses.subtitle_teacher');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      <AddCourseModal 
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onSave={handleSaveCourse}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t('courses.title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {getSubtitle()}
          </p>
        </div>
        
        {(userRole === 'coordinator' || userRole === 'admin') && (
            <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                <Plus className="w-4 h-4 mr-2" /> {t('courses.new_course')}
            </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder={t('courses.search_placeholder')}
                className="pl-9 bg-white dark:bg-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCourses.map((course) => (
              <div 
                key={course.id} 
                onClick={() => setSelectedCourseId(course.id)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                  {/* Image Header */}
                  <div className="h-32 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <img 
                          src={course.image} 
                          alt={course.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                          <Badge className="bg-white/90 text-slate-900 hover:bg-white border-none shadow-sm backdrop-blur-sm">
                              {course.abbreviation}
                          </Badge>
                          <Badge variant="outline" className="text-white border-white/40 backdrop-blur-sm bg-black/20">
                              {course.type}
                          </Badge>
                      </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {course.name}
                          </h3>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-slate-400 hover:text-slate-600">
                                      <MoreVertical className="w-4 h-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>{t('actions.actions')}</DropdownMenuLabel>
                                  <DropdownMenuItem>{t('actions.view_details')}</DropdownMenuItem>
                                  {(userRole === 'coordinator' || userRole === 'admin') && (
                                      <>
                                        <DropdownMenuItem>{t('actions.edit_settings')}</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">{t('actions.archive')}</DropdownMenuItem>
                                      </>
                                  )}
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                          {course.description}
                      </p>

                      {/* Footer Stats */}
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {course.durationYears} {t('courses.years')}
                          </div>
                          <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              {course.totalCredits} ECTS
                          </div>
                          <div className="ml-auto flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                              {t('courses.open')}
                              <Briefcase className="w-3.5 h-3.5" />
                          </div>
                      </div>
                  </div>
              </div>
          ))}

          {/* Empty State Add Button (Coordinator/Admin) */}
          {(userRole === 'coordinator' || userRole === 'admin') && (
              <button 
                  onClick={handleAddCourse}
                  className="h-full min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
              >
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                      <span className="font-semibold text-lg block">{t('courses.add_new')}</span>
                      <span className="text-sm opacity-70">{t('courses.create_program')}</span>
                  </div>
              </button>
          )}
      </div>
      
      {visibleCourses.length === 0 && userRole !== 'coordinator' && userRole !== 'admin' && (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <BookOpen className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">{t('courses.no_assigned')}</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  {t('courses.no_assigned_desc')}
              </p>
          </div>
      )}
    </div>
  );
};
