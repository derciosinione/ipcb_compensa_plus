import { Outlet } from "react-router";
import { FloatingAIChat } from "./FloatingAIChat";
import { Layout } from "./Layout";
import type { User, UserRole } from "../types/user";

interface AppShellProps {
  user: User;
  onLogout: () => void;
  onRoleChange: (role: UserRole) => void;
}

export const AppShell = ({ user, onLogout, onRoleChange }: AppShellProps) => {
  return (
    <>
      <Layout user={user} onLogout={onLogout} onRoleChange={onRoleChange}>
        <Outlet />
      </Layout>
      <FloatingAIChat userRole={user.role} />
    </>
  );
};
