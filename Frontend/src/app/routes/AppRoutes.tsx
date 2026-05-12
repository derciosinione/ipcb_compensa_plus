import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from '../layouts/AppShell';
import { LoginPage, NotFoundPage } from '../pages';
import { VerifyMagicLinkPage } from '../pages/Login/VerifyMagicLinkPage';
import type { AuthView } from '../types/auth';
import type { AuthenticatedUser, UserRole } from '../types/user';
import { appPaths } from './paths';
import { ProtectedRoute } from './ProtectedRoute';
import { getProtectedRouteDefinitions } from './routeConfig';

interface AppRoutesProps {
  authView: AuthView;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  onAuthViewChange: (view: AuthView) => void;
  onLogin: (user: AuthenticatedUser) => void;
  onLogout: () => void;
  onRoleChange: (role: UserRole) => void;
}

export const AppRoutes = ({
  authView,
  isAuthReady,
  isAuthenticated,
  user,
  onAuthViewChange,
  onLogin,
  onLogout,
  onRoleChange,
}: AppRoutesProps) => {
  const protectedRoutes = user ? getProtectedRouteDefinitions(user) : [];
  const canRenderProtectedShell = isAuthenticated && Boolean(user);

  if (!isAuthReady) {
    return null;
  }

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
      <Route path={appPaths.authVerify} element={<VerifyMagicLinkPage onAuthenticated={onLogin} />} />

      <Route
        element={
          <ProtectedRoute isAuthenticated={canRenderProtectedShell}>
            <AppShell user={user!} onLogout={onLogout} onRoleChange={onRoleChange} />
          </ProtectedRoute>
        }
      >
        <Route path={appPaths.root} element={<Navigate to={appPaths.dashboard} replace />} />
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                isAuthenticated={canRenderProtectedShell}
                user={user}
                allowedRoles={route.allowedRoles}
              >
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
