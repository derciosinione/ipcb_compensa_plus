import React, { useEffect, useState } from 'react';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { clearAuthSession, getStoredAuthSession, mapSessionToUser, saveActiveRole } from './services/auth/authSession';
import type { AuthView } from './types/auth';
import type { AuthenticatedUser, UserRole } from './types/user';

export default function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedSession = getStoredAuthSession();

    if (storedSession) {
      setUser(mapSessionToUser(storedSession));
      setIsAuthenticated(true);
    }

    setIsAuthReady(true);
  }, []);

  const handleLogin = (authenticatedUser: AuthenticatedUser) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setUser((currentUser) => {
      if (!currentUser || !currentUser.roles.includes(role)) {
        return currentUser;
      }

      saveActiveRole(role);
      return { ...currentUser, role };
    });
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AppProviders>
      <AppRoutes
        authView={authView}
        isAuthReady={isAuthReady}
        isAuthenticated={isAuthenticated}
        user={user}
        onAuthViewChange={setAuthView}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRoleChange={handleRoleChange}
      />
    </AppProviders>
  );
}
