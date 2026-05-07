import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import { Layout } from './components/compensa/Layout';
import { Overview } from './components/compensa/Overview';
import { TeacherView } from './components/compensa/TeacherView';
import { CoordinatorView } from './components/compensa/CoordinatorView';
import { CalendarView } from './components/compensa/CalendarView';
import { CoursesView } from './components/compensa/CoursesView';
import { NotificationsView } from './components/compensa/NotificationsView';
import { ClassroomsView } from './components/compensa/ClassroomsView';
import { UsersView } from './components/compensa/UsersView';
import { SystemCalendarView } from './components/compensa/SystemCalendarView';
import { ProjectStoryboard } from './components/compensa/ProjectStoryboard';
import { FullProjectStoryboard } from './components/compensa/FullProjectStoryboard';
import { UserProfile } from './components/compensa/UserProfile';
import { AIDocumentConverter } from './components/compensa/AIDocumentConverter';
import { FloatingAIChat } from './components/compensa/FloatingAIChat';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { mockUser, UserRole, User } from './components/compensa/data';
import { ThemeProvider } from './components/ui/theme-provider';
import { LanguageProvider } from './components/compensa/LanguageContext';
import { EmptyState } from './components/common/EmptyState';
import { Settings, Sliders } from 'lucide-react';
import { Toaster } from 'sonner@2.0.3';

// 1. Auth Guard Component
const ProtectedRoute = ({ isAuthenticated, children }: { isAuthenticated: boolean, children: React.ReactNode }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 2. Application Wrapper that provides State & Layout
const AppLayout = ({ 
  user, 
  onRoleChange, 
  onLogout 
}: { 
  user: User, 
  onRoleChange: (role: UserRole) => void,
  onLogout: () => void 
}) => {
  return (
    <Layout
      user={user}
      onRoleChange={onRoleChange}
      onLogout={onLogout}
    >
      {/* This renders the matched child route */}
      <Outlet />
    </Layout>
  );
};

export default function App() {
  const [user, setUser] = useState(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('signin'); // Used for the /login page internal toggle

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
    <ThemeProvider defaultTheme="light" storageKey="compensa-theme">
      <LanguageProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  authView === 'signin' ? 
                    <SignInPage onNavigate={setAuthView} onLogin={handleLogin} /> : 
                    <SignUpPage onNavigate={setAuthView} onLogin={handleLogin} />
                )
              } 
            />

            {/* Full Screen Storyboard (No Layout) */}
            <Route 
              path="/full-storyboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                   <FullProjectStoryboard onExit={() => window.history.back()} />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes Wrapped in Layout */}
            <Route 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AppLayout user={user} onRoleChange={handleRoleChange} onLogout={handleLogout} />
                  <FloatingAIChat />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Overview />} />
              
              <Route path="/requests" element={
                (user.role === 'coordinator' || user.role === 'admin') 
                  ? <CoordinatorView userRole={user.role} /> 
                  : <TeacherView />
              } />
              
              <Route path="/calendar" element={<CalendarView userRole={user.role} />} />
              <Route path="/notifications" element={<NotificationsView />} />
              <Route path="/courses" element={<CoursesView user={user} />} />
              <Route path="/classrooms" element={<ClassroomsView user={user} />} />
              <Route path="/users" element={<UsersView />} />
              <Route path="/system-calendar" element={<SystemCalendarView />} />
              <Route path="/project-storyboard" element={<ProjectStoryboard />} />
              <Route path="/ai-converter" element={<AIDocumentConverter />} />
              <Route path="/profile" element={<UserProfile user={user} />} />
              
              <Route path="/settings" element={
                <EmptyState icon={Settings} title="System Settings" description="Global configuration coming soon." />
              } />
              <Route path="/preferences" element={
                <EmptyState icon={Sliders} title="Preferences" description="System preferences coming soon." />
              } />
              
              {/* Catch-all 404 Route */}
              <Route path="*" element={
                <div className="p-12 text-center text-slate-500">Page not found.</div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
