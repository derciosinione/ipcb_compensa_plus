import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { listUsers } from "../../services/users/usersApi";
import type { PlatformUser } from "../../services/users/userTypes";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import type { User } from "../../types/user";
import { useLanguage } from "../../providers/LanguageContext";
import {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from "../../services/courses/coursesApi";
import type {
  Course,
  CourseDegreeType,
  UpsertCourseRequest,
} from "../../services/courses/courseTypes";
import { appPaths } from "../../routes/paths";
import { useAcademicYear } from "../../providers/AcademicYearContext";

interface CoursesPageProps {
  user: User;
}

interface CourseFormState {
  name: string;
  abbreviation: string;
  type: CourseDegreeType;
  description: string;
  durationYears: string;
  totalCredits: string;
  coordinatorUserId: string;
  imageUrl: string;
  isActive: boolean;
}

const degreeTypeOptions: Array<{ value: CourseDegreeType; label: string }> = [
  { value: "Licenciatura", label: "Licenciatura" },
  { value: "Mestrado", label: "Mestrado" },
  { value: "CTeSP", label: "CTeSP" },
];

const initialFormState: CourseFormState = {
  name: "",
  abbreviation: "",
  type: "Licenciatura",
  description: "",
  durationYears: "3",
  totalCredits: "180",
  coordinatorUserId: "",
  imageUrl: "",
  isActive: true,
};

export const CoursesPage = ({ user }: CoursesPageProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formState, setFormState] = useState<CourseFormState>(initialFormState);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedYear } = useAcademicYear();

  const isAdmin = user.role === "admin";

  const loadCourses = async () => {
    if (!selectedYear) return;
    try {
      setIsLoading(true);
      const [result, loadedUsers] = await Promise.all([
        listCourses(undefined, selectedYear.id),
        listUsers(),
      ]);
      setCourses(result);
      setUsers(loadedUsers);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load courses."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [selectedYear]);

  const visibleCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return courses;
    }

    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(normalizedSearch) ||
        course.abbreviation.toLowerCase().includes(normalizedSearch) ||
        course.type.toLowerCase().includes(normalizedSearch),
    );
  }, [courses, searchTerm]);

  const openCreate = () => {
    setEditingCourse(null);
    setFormState(initialFormState);
    setIsFormOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setFormState({
      name: course.name,
      abbreviation: course.abbreviation,
      type: course.type,
      description: course.description,
      durationYears: course.durationYears.toString(),
      totalCredits: course.totalCredits.toString(),
      coordinatorUserId: course.coordinatorUserId ?? "",
      imageUrl: course.imageUrl,
      isActive: course.isActive,
    });
    setIsFormOpen(true);
  };

  const buildRequest = (): UpsertCourseRequest | null => {
    const durationYears = Number(formState.durationYears);
    const totalCredits = Number(formState.totalCredits);

    if (!formState.name.trim()) {
      toast.error("Course name is required.");
      return null;
    }

    if (!formState.abbreviation.trim()) {
      toast.error("Course abbreviation is required.");
      return null;
    }

    if (!formState.description.trim()) {
      toast.error("Course description is required.");
      return null;
    }

    if (!Number.isInteger(durationYears) || durationYears <= 0) {
      toast.error("Duration must be a positive whole number.");
      return null;
    }

    if (!Number.isInteger(totalCredits) || totalCredits <= 0) {
      toast.error("ECTS must be a positive whole number.");
      return null;
    }

    return {
      name: formState.name.trim(),
      abbreviation: formState.abbreviation.trim(),
      type: formState.type,
      description: formState.description.trim(),
      durationYears,
      totalCredits,
      coordinatorUserId: formState.coordinatorUserId.trim() || null,
      imageUrl: formState.imageUrl.trim() || null,
      isActive: formState.isActive,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const request = buildRequest();

    if (!request) {
      return;
    }

    try {
      setIsSaving(true);
      const saved = editingCourse
        ? await updateCourse(editingCourse.id, request)
        : await createCourse(request);

      if (!saved) {
        throw new Error("Course response was empty.");
      }

      setCourses((current) => {
        if (editingCourse) {
          return current.map((course) =>
            course.id === saved.id ? saved : course,
          );
        }

        return [...current, saved].sort((a, b) => a.name.localeCompare(b.name));
      });

      setIsFormOpen(false);
      toast.success(editingCourse ? "Course updated." : "Course created.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save course."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
  };

  const executeDelete = async () => {
    if (!courseToDelete) return;
    const courseId = courseToDelete.id;
    setCourseToDelete(null);

    try {
      await deleteCourse(courseId);
      setCourses((current) => current.filter((item) => item.id !== courseId));
      toast.success("Course deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete course."));
    }
  };

  const getSubtitle = () => {
    if (user.role === "admin") return t("courses.subtitle_admin");
    if (user.role === "coordinator") return t("courses.subtitle_coordinator");
    return t("courses.subtitle_teacher");
  };


  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t("courses.title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {getSubtitle()}
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> {t("courses.new_course")}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("courses.search_placeholder")}
            className="pl-9 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading courses...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(appPaths.courseDetails.replace(":id", course.id))}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="h-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                  <Badge className="bg-white/90 text-slate-900 hover:bg-white border-none shadow-sm backdrop-blur-sm">
                    {course.abbreviation}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-white border-white/40 backdrop-blur-sm bg-black/20"
                  >
                    {course.type}
                  </Badge>
                  {!course.isActive && (
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                    {course.name}
                  </h3>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => event.stopPropagation()}
                          className="h-8 w-8 -mr-2 -mt-2 text-slate-400 hover:text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t("actions.actions")}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(course);
                          }}
                        >
                          {t("actions.edit_settings")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(course);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("actions.archive")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>

                {(() => {
                  const coord = course.coordinatorUserId 
                    ? users.find(u => u.id === course.coordinatorUserId) 
                    : null;
                  return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        Coordinator: <span className="text-slate-800 dark:text-slate-200 font-semibold">{coord ? (coord.fullName || coord.email) : "Not Assigned"}</span>
                      </span>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {course.durationYears} {t("courses.years")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.totalCredits} ECTS
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isAdmin && (
            <button
              onClick={openCreate}
              className="h-full min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-lg block">
                  {t("courses.add_new")}
                </span>
                <span className="text-sm opacity-70">
                  {t("courses.create_program")}
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {!isLoading && visibleCourses.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            {t("courses.no_assigned")}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {t("courses.no_assigned_desc")}
          </p>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Edit Course" : t("modal.add_course_title")}
              </DialogTitle>
              <DialogDescription>
                {t("modal.add_course_desc")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="course-name">{t("modal.course_name")}</Label>
                <Input
                  id="course-name"
                  placeholder={t("modal.course_name_placeholder")}
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-1 space-y-2">
                <Label htmlFor="course-abbreviation">{t("modal.abbr")}</Label>
                <Input
                  id="course-abbreviation"
                  placeholder="LEI"
                  value={formState.abbreviation}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      abbreviation: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("modal.degree_type")}</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: CourseDegreeType) =>
                    setFormState((current) => ({ ...current, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("modal.select_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-duration">{t("modal.duration")}</Label>
                <Input
                  id="course-duration"
                  min={1}
                  type="number"
                  value={formState.durationYears}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      durationYears: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-credits">{t("modal.total_ects")}</Label>
                <Input
                  id="course-credits"
                  min={1}
                  type="number"
                  value={formState.totalCredits}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      totalCredits: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-description">
                {t("modal.description")}
              </Label>
              <Textarea
                id="course-description"
                placeholder={t("modal.desc_placeholder")}
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="course-image">Image URL</Label>
                <Input
                  id="course-image"
                  placeholder="https://..."
                  value={formState.imageUrl}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex min-w-[180px] items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                <div>
                  <Label htmlFor="course-active">Active</Label>
                  <p className="text-xs text-slate-500">Available in forms</p>
                </div>
                <Switch
                  id="course-active"
                  checked={formState.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((current) => ({
                      ...current,
                      isActive: checked,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCourse ? "Save Course" : t("modal.create_course")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={courseToDelete !== null}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course "
              {courseToDelete?.name}"? This action is permanent and will remove
              all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
