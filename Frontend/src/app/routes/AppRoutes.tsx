import { Navigate, Route, Routes } from 'react-router';
import { FloatingAIChat } from '../layouts/FloatingAIChat';
import { User, UserRole } from '../mocks/data';
import { AppShell } from '../layouts/AppShell';
import { FullStoryboardPage, LoginPage, NotFoundPage } from '../pages';
import type { AuthView } from '../types/auth';
import { appPaths } from './paths';
import { ProtectedRoute } from './ProtectedRoute';
import { getProtectedRouteDefinitions } from './routeConfig';

interface AppRoutesProps {
  authView: AuthView;
  isAuthenticated: boolean;
  user: User;
  onAuthViewChange: (view: AuthView) => void;
  onLogin: () => void;
  onLogout: () => void;
  onRoleChange: (role: UserRole) => void;
}

export const AppRoutes = ({
  authView,
  isAuthenticated,
  user,
  onAuthViewChange,
  onLogin,
  onLogout,
  onRoleChange,
}: AppRoutesProps) => {
  const protectedRoutes = getProtectedRouteDefinitions(user);

  return (
    <Routes>
      <Route
        path={appPaths.login}
        element={
          isAuthenticated ? (
            <Navigate to={appPaths.dashboard} replace />
          ) : (
            <LoginPage authView={authView} onAuthViewChange={onAuthViewChange} onLogin={onLogin} />
          )
        }
      />

      <Route
        path={appPaths.fullStoryboard}
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FullStoryboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <>
              <AppShell user={user} onRoleChange={onRoleChange} onLogout={onLogout} />
              <FloatingAIChat />
            </>
          </ProtectedRoute>
        }
      >
        <Route path={appPaths.root} element={<Navigate to={appPaths.dashboard} replace />} />
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
