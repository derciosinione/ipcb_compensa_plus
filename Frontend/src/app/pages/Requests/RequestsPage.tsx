import { useParams } from "react-router";
import type { AuthenticatedUser, UserRole } from "../../types/user";
import { CoordinatorRequestsPage } from "../CoordinatorRequests/CoordinatorRequestsPage";
import { TeacherRequestsPage } from "../TeacherRequests/TeacherRequestsPage";

interface RequestsPageProps {
  userRole: UserRole;
  user: AuthenticatedUser;
}

export const RequestsPage = ({ userRole, user }: RequestsPageProps) => {
  const { id } = useParams();

  if (userRole === "coordinator" || userRole === "admin") {
    return <CoordinatorRequestsPage userRole={userRole} requestId={id} user={user} />;
  }

  return <TeacherRequestsPage user={user} requestId={id} />;
};
