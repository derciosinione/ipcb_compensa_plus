import type { AuthenticatedUser, UserRole } from "../../types/user";
import { CoordinatorRequestsPage } from "../CoordinatorRequests/CoordinatorRequestsPage";
import { TeacherRequestsPage } from "../TeacherRequests/TeacherRequestsPage";

interface RequestsPageProps {
  userRole: UserRole;
  user: AuthenticatedUser;
}

export const RequestsPage = ({ userRole, user }: RequestsPageProps) => {
  if (userRole === "coordinator" || userRole === "admin") {
    return <CoordinatorRequestsPage userRole={userRole} />;
  }

  return <TeacherRequestsPage user={user} />;
};
