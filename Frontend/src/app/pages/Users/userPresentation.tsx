import { GraduationCap, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/utils";
import type { PlatformUser, UserRole } from "../../services/users/userTypes";

const roleStyles: Record<string, string> = {
  Teacher:
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30",
  Coordinator:
    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30",
  Admin:
    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30",
  Student:
    "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-900/30",
};

const roleIcons = {
  Teacher: GraduationCap,
  Coordinator: ShieldCheck,
  Admin: ShieldCheck,
  Student: UserRound,
};

export const toIdentityRole = (role: string): UserRole => {
  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole === "admin") return "Admin";
  if (normalizedRole === "coordinator") return "Coordinator";
  if (normalizedRole === "student") return "Student";

  return "Teacher";
};

export const getUserInitials = (user: PlatformUser) => {
  const name = user.fullName || user.email;

  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

interface UserRoleBadgesProps {
  roles: UserRole[];
}

export const UserRoleBadges = ({ roles }: UserRoleBadgesProps) => (
  <div className="flex flex-wrap gap-1.5">
    {roles.map((role) => {
      const RoleIcon = roleIcons[role] ?? UserRound;

      return (
        <Badge
          key={role}
          variant="secondary"
          className={cn(
            "flex w-fit items-center gap-1 border",
            roleStyles[role] ?? roleStyles.Student,
          )}
        >
          <RoleIcon className="w-3 h-3" />
          {role}
        </Badge>
      );
    })}
  </div>
);
