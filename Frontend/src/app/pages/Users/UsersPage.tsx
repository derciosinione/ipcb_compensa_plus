import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, UserPlus, Upload } from "lucide-react";
import { AddUserModal } from "./components/AddUserModal";
import { TeacherUnitsModal } from "./components/TeacherUnitsModal";
import { BulkImportUsersSheet } from "./components/BulkImportUsersSheet";
import { UsersTable } from "./components/UsersTable";
import { useLanguage } from "../../providers/LanguageContext";
import { toast } from "sonner";
import {
  createUser,
  listRoles,
  listUsers,
} from "../../services/users/usersApi";
import type {
  CreateUserRequest,
  PlatformUser,
  UserRole,
} from "../../services/users/userTypes";
import {
  getCourseDetails,
  listCourses,
} from "../../services/courses/coursesApi";
import type {
  Course,
  CurricularUnit,
} from "../../services/courses/courseTypes";
import {
  listUserUnitAssignments,
  saveUserUnitAssignments,
} from "../../services/assignments/assignmentsApi";
import type { CourseAssignmentInput } from "../../services/assignments/assignmentTypes";
import type { ImportedUser } from "../../types/user";
import { toIdentityRole } from "./userPresentation";
import { getErrorMessage } from "../../utils/errors";

export const UsersPage = () => {
  const { t } = useLanguage();

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([
    "Admin",
    "Coordinator",
    "Teacher",
    "Student",
  ]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<CurricularUnit[]>([]);
  const [assignedUnitIds, setAssignedUnitIds] = useState<string[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<
    CourseAssignmentInput[]
  >([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAssignUnitsOpen, setIsAssignUnitsOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | undefined>(
    undefined,
  );

  const totalUserPages = Math.ceil(users.length / userPageSize);
  const paginatedUsers = users.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize,
  );

  const loadUsers = async (query = search) => {
    const loadedUsers = await listUsers(query);
    setUsers(loadedUsers);
    setUserPage(1);
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsLoading(true);
        const [loadedRoles, loadedUsers, loadedCourses] = await Promise.all([
          listRoles(),
          listUsers(),
          listCourses(),
        ]);

        setRoles(loadedRoles.map((role) => role.name));
        setUsers(loadedUsers);
        setCourses(loadedCourses);

        const details = await Promise.all(
          loadedCourses.map((course) => getCourseDetails(course.id)),
        );

        setUnits(details.flatMap((detail) => detail?.units ?? []));
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load users."));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPageData();
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await loadUsers(search);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to search users."));
    }
  };

  const handleAddUser = async (request: CreateUserRequest) => {
    try {
      setIsSavingUser(true);
      await createUser(request);
      await loadUsers();
      setIsAddUserOpen(false);
      toast.success("User created successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create user."));
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleBulkImport = async (newUsers: ImportedUser[]) => {
    try {
      setIsSavingUser(true);

      await Promise.all(
        newUsers.map((user) =>
          createUser({
            fullName: user.name,
            email: user.email,
            roles: [toIdentityRole(user.role)],
          }),
        ),
      );

      await loadUsers();
      toast.success(`Successfully imported ${newUsers.length} users.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to import users."));
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleOpenAssignUnits = async (user: PlatformUser) => {
    setSelectedUser(user);
    setAssignedUnitIds([]);
    setAssignedCourses([]);
    setIsAssignUnitsOpen(true);

    try {
      const assignments = await listUserUnitAssignments(user.id);
      setAssignedUnitIds(
        assignments.units.map((assignment) => assignment.curricularUnitId),
      );
      setAssignedCourses(
        assignments.courses.map((assignment) => ({
          courseId: assignment.courseId,
          isCoordinator: assignment.isCoordinator,
        })),
      );
    } catch (error) {
      setAssignedUnitIds([]);
      setAssignedCourses([]);
      toast.error(getErrorMessage(error, "Failed to load assignments."));
    }
  };

  const handleSaveUnitAssignments = async (
    curricularUnitIds: string[],
    courseAssignments: CourseAssignmentInput[],
  ) => {
    if (!selectedUser) return;

    try {
      setIsSavingAssignments(true);
      await saveUserUnitAssignments(
        selectedUser.id,
        selectedUser.email,
        curricularUnitIds,
        courseAssignments,
      );
      setAssignedUnitIds(curricularUnitIds);
      setAssignedCourses(courseAssignments);
      setUnits((currentUnits) =>
        currentUnits.map((unit) => {
          const teacherIds = new Set(unit.teacherIds);

          if (curricularUnitIds.includes(unit.id)) {
            teacherIds.add(selectedUser.id);
          } else {
            teacherIds.delete(selectedUser.id);
          }

          return { ...unit, teacherIds: Array.from(teacherIds) };
        }),
      );
      setIsAssignUnitsOpen(false);
      toast.success(
        `Updated unit assignments for ${selectedUser.fullName || selectedUser.email}.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save assignments."));
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const userAssignmentCounts = useMemo(() => {
    const counts = new Map<string, number>();

    units.forEach((unit) => {
      unit.teacherIds.forEach((teacherId) => {
        counts.set(teacherId, (counts.get(teacherId) ?? 0) + 1);
      });
    });

    return counts;
  }, [units]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AddUserModal
        isOpen={isAddUserOpen}
        isSaving={isSavingUser}
        roles={roles}
        onClose={() => setIsAddUserOpen(false)}
        onSave={handleAddUser}
      />

      <TeacherUnitsModal
        isOpen={isAssignUnitsOpen}
        isSaving={isSavingAssignments}
        onClose={() => setIsAssignUnitsOpen(false)}
        onSave={handleSaveUnitAssignments}
        user={selectedUser}
        courses={courses}
        units={units}
        assignedUnitIds={assignedUnitIds}
        assignedCourses={assignedCourses}
      />

      <BulkImportUsersSheet
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImport={handleBulkImport}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t("users.title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("users.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkImportOpen(true)}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Upload className="w-4 h-4 mr-2" /> Bulk Import
          </Button>
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4 mr-2" /> {t("actions.add_user")}
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row justify-between gap-4"
      >
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("users.search")}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4 mr-2" /> {t("actions.filter")}
          </Button>
        </div>
      </form>

      <UsersTable
        assignmentCounts={userAssignmentCounts}
        currentPage={userPage}
        isLoading={isLoading}
        labels={{
          actions: t("actions.actions"),
          assignUnits: t("actions.assign_units"),
          deactivate: t("actions.deactivate"),
          editDetails: t("actions.edit_details"),
          email: t("users.email"),
          name: t("users.name"),
          role: t("users.role"),
        }}
        onAssignUnits={handleOpenAssignUnits}
        onPageChange={setUserPage}
        totalPages={totalUserPages}
        users={paginatedUsers}
      />
    </div>
  );
};
