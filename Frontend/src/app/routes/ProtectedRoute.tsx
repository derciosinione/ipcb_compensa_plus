import React from 'react';
import { Navigate } from 'react-router';
import { appPaths } from './paths';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to={appPaths.login} replace />;
  }

  return <>{children}</>;
};
