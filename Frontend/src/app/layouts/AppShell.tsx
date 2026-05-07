import { Outlet } from 'react-router';
import { Layout } from './Layout';
import { User, UserRole } from '../mocks/data';

interface AppShellProps {
  user: User;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const AppShell = ({ user, onRoleChange, onLogout }: AppShellProps) => {
  return (
    <Layout user={user} onRoleChange={onRoleChange} onLogout={onLogout}>
      <Outlet />
    </Layout>
  );
};
