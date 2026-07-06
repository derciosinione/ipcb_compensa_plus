import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { ClassDetailsView } from "../../components/domain/requests/ClassDetailsView";
import { 
  getCourseDetails, 
  createClassSchedule, 
  updateClassSchedule, 
  deleteClassSchedule 
} from "../../services/courses/coursesApi";
import { listClassrooms } from "../../services/classrooms/classroomsApi";
import { listUsers } from "../../services/users/usersApi";
import { getErrorMessage } from "../../utils/errors";
import { toast } from "sonner";
import type { 
  Course as ViewCourse, 
  CurricularUnit, 
  ClassGroup, 
  TimeSlot 
} from "../../types/academic";
import type { PlatformUser } from "../../services/users/userTypes";
import type { Classroom } from "../../services/classrooms/classroomTypes";
import type { AuthenticatedUser } from "../../types/user";
import { useAcademicYear } from "../../providers/AcademicYearContext";
import { useLanguage } from "../../providers/LanguageContext";

interface ClassDetailsPageProps {
  user: AuthenticatedUser | null;
}

export const ClassDetailsPage = ({ user }: ClassDetailsPageProps) => {
  const { courseId, classId } = useParams<{ courseId: string; classId: string }>();
  const navigate = useNavigate();
  const userRole = user?.role || "teacher";
  const { selectedYear: currentAcademicYear } = useAcademicYear();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ViewCourse | null>(null);
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [allClasses, setAllClasses] = useState<ClassGroup[]>([]);
  const [courseUnits, setCourseUnits] = useState<CurricularUnit[]>([]);
  const [schedules, setSchedules] = useState<TimeSlot[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<PlatformUser[]>([]);

  const fetchData = useCallback(async () => {
    if (!courseId || !classId) return;

    try {
      setLoading(true);
      const [details, classroomsRes, usersRes] = await Promise.all([
        getCourseDetails(courseId),
        listClassrooms(),
        listUsers()
      ]);

      const mappedUnits: CurricularUnit[] = (details.units || []).map(u => ({
        id: u.id,
        name: u.name,
        ects: u.ects,
        semester: u.semester,
        regentId: u.regentId,
        teacherIds: u.teacherIds || [],
        courseId: courseId
      }));

      const mappedClasses: ClassGroup[] = (details.classes || []).map(c => ({
        id: c.id,
        name: c.name,
        year: c.year,
        courseId: courseId,
        teacherId: c.teacherId,
        academicYearId: (c as any).academicYearId
      }));

      const mappedSchedules: TimeSlot[] = (details.schedules || []).map(s => {
        const unit = (details.units || []).find(u => u.id === s.curricularUnitId);
        const cls = (details.classes || []).find(c => c.id === s.classGroupId);
        const room = (classroomsRes || []).find(r => r.id === s.classroomId);

        return {
          id: s.id,
          unitId: s.curricularUnitId,
          unit: unit?.name || "Unknown",
          classGroupId: s.classGroupId,
          classGroup: cls?.name || "Unknown",
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime || "",
          endTime: s.endTime || "",
          room: room?.name || "Unknown",
          classroomId: s.classroomId,
          type: (s.componentType || "").toLowerCase() as "theoretical" | "practical",
          semester: s.semester
        };
      });

      const currentClass = mappedClasses.find(c => c.id === classId);
      if (!currentClass) {
        toast.error(t("class_details.toast_not_found"));
        navigate(`/courses/${courseId}`);
        return;
      }

      setCourse({
        id: details.course.id,
        name: details.course.name,
        abbreviation: details.course.abbreviation,
        description: details.course.description,
        type: details.course.type,
        durationYears: details.course.durationYears,
        totalCredits: details.course.totalCredits,
        coordinatorId: details.course.coordinatorUserId ?? "",
        image: details.course.imageUrl,
      });
      setClassGroup(currentClass);
      setAllClasses(mappedClasses);
      setCourseUnits(mappedUnits);
      setSchedules(mappedSchedules);
      setClassrooms(classroomsRes);
      setTeachers(usersRes);
    } catch (error) {
      toast.error(getErrorMessage(error, t("class_details.toast_load_error")));
    } finally {
      setLoading(false);
    }
  }, [courseId, classId, navigate, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSchedule = async (data: Omit<TimeSlot, "id">) => {
    if (!currentAcademicYear) {
      toast.error(t("courses.toast_active_year_missing"));
      return;
    }

    try {
      const targetUnitId = data.curricularUnitId || (data as any).unitId;
      const targetSemester = courseUnits.find(u => u.id === targetUnitId)?.semester || 1;
      
      await createClassSchedule(courseId!, classId!, {
        academicYearId: currentAcademicYear.id,
        curricularUnitId: targetUnitId,
        classroomId: data.room || (data as any).classroomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        semester: targetSemester as 1 | 2,
        componentType: data.type === "practical" ? "Practical" : "Theoretical",
        isActive: true
      });
      toast.success(t("class_details.toast_add_success"));
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, t("class_details.toast_add_error")));
    }
  };

  const handleUpdateSchedule = async (id: string, data: Omit<TimeSlot, "id">) => {
    if (!currentAcademicYear) {
      toast.error(t("courses.toast_active_year_missing"));
      return;
    }

    try {
      const targetUnitId = data.curricularUnitId || (data as any).unitId;
      const targetSemester = courseUnits.find(u => u.id === targetUnitId)?.semester || 1;

      await updateClassSchedule(courseId!, classId!, id, {
        academicYearId: currentAcademicYear.id,
        curricularUnitId: targetUnitId,
        classroomId: data.room || (data as any).classroomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        semester: targetSemester as 1 | 2,
        componentType: data.type === "practical" ? "Practical" : "Theoretical",
        isActive: true
      });
      toast.success(t("class_details.toast_update_success"));
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, t("class_details.toast_update_error")));
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteClassSchedule(courseId!, classId!, id);
      toast.success(t("class_details.toast_delete_success"));
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, t("class_details.toast_delete_error")));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">{t("class_details.loading")}</p>
      </div>
    );
  }

  if (!classGroup) return null;

  const teacher = teachers.find(t => t.id === classGroup.teacherId);

  return (
    <div className="p-4 md:p-8">
      <ClassDetailsView
        course={course}
        classGroup={classGroup}
        teacher={teacher}
        schedules={schedules}
        allClasses={allClasses}
        courseUnits={courseUnits}
        classrooms={classrooms}
        onBack={() => navigate(`/courses/${courseId}`)}
        onAddSchedule={handleAddSchedule}
        onUpdateSchedule={handleUpdateSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        userRole={userRole as any}
      />
    </div>
  );
};
