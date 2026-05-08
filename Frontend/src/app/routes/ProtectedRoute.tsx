import React from 'react';
import { Navigate } from 'react-router';
import type { AuthenticatedUser, UserRole } from '../types/user';
import { appPaths } from './paths';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  user?: AuthenticatedUser | null;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  isAuthenticated,
  user,
  allowedRoles,
  children,
}: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to={appPaths.login} replace />;
  }

  if (allowedRoles?.length && !user?.roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to={appPaths.dashboard} replace />;
  }

  return <>{children}</>;
};
