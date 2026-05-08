import { UserRole } from '../../mocks/data';
import { CoordinatorRequestsPage } from '../CoordinatorRequests/CoordinatorRequestsPage';
import { TeacherRequestsPage } from '../TeacherRequests/TeacherRequestsPage';

interface RequestsPageProps {
  userRole: UserRole;
}

export const RequestsPage = ({ userRole }: RequestsPageProps) => {
  if (userRole === 'coordinator' || userRole === 'admin') {
    return <CoordinatorRequestsPage userRole={userRole} />;
  }

  return <TeacherRequestsPage />;
};
