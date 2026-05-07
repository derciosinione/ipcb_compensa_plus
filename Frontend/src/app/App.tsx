import React, { useState } from 'react';
import { mockUser, UserRole } from './mocks/data';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import type { AuthView } from './types/auth';

export default function App() {
  const [user, setUser] = useState(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signin');

  const handleRoleChange = (role: UserRole) => {
    setUser({ ...user, role });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AppProviders>
      <AppRoutes
        authView={authView}
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
