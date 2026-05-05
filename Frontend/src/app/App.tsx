import React, { useState } from 'react';
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
import { mockUser, UserRole } from './components/compensa/data';
import { ThemeProvider } from './components/ui/theme-provider';
import { LanguageProvider } from './components/compensa/LanguageContext';
import { EmptyState } from './components/common/EmptyState';
import { User, Settings, Sliders } from 'lucide-react';
import { Toaster } from 'sonner@2.0.3';

export default function App() {
  const [user, setUser] = useState(mockUser);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('signin'); // 'signin' or 'signup'

  const handleRoleChange = (role: UserRole) => {
    setUser({ ...user, role });
    setCurrentView('dashboard'); 
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('signin');
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="compensa-theme">
        <LanguageProvider>
          <Toaster richColors position="top-right" />
          {authView === 'signin' ? (
            <SignInPage onNavigate={setAuthView} onLogin={handleLogin} />
          ) : (
            <SignUpPage onNavigate={setAuthView} onLogin={handleLogin} />
          )}
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  // Full Screen Mode for Storyboard
  if (currentView === 'full-storyboard') {
     return (
        <ThemeProvider defaultTheme="light" storageKey="compensa-theme">
           <LanguageProvider>
             <FullProjectStoryboard onExit={() => setCurrentView('dashboard')} />
           </LanguageProvider>
        </ThemeProvider>
     );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Overview onNavigate={setCurrentView} />;
      case 'requests':
        if (user.role === 'coordinator' || user.role === 'admin') return <CoordinatorView userRole={user.role} />;
        if (user.role === 'teacher') return <TeacherView />;
        return <TeacherView />; // Default fallback
      case 'calendar':
        return <CalendarView userRole={user.role} />;
      case 'notifications':
        return <NotificationsView />;
      case 'courses':
        return <CoursesView user={user} />;
      case 'classrooms':
        return <ClassroomsView user={user} />;
      case 'users':
        return <UsersView />;
      case 'system-calendar':
        return <SystemCalendarView />;
      case 'project-storyboard':
        return <ProjectStoryboard />;
      case 'ai-converter':
        return <AIDocumentConverter />;
      case 'profile':
        return <UserProfile user={user} />;
      case 'settings':
        return (
          <EmptyState
            icon={Settings}
            title="System Settings"
            description="Global configuration coming soon."
          />
        );
      case 'profile':
        return (
          <EmptyState
            icon={User}
            title="My Profile"
            description="User profile settings coming soon."
          />
        );
      case 'preferences':
        return (
          <EmptyState
            icon={Sliders}
            title="Preferences"
            description="System preferences coming soon."
          />
        );
      default:
        return <div className="p-12 text-center text-slate-500">Page under construction: {currentView}</div>;
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="compensa-theme">
      <LanguageProvider>
        <Toaster richColors position="top-right" />
        <Layout
          user={user}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
        >
          {renderContent()}
        </Layout>
        <FloatingAIChat />
      </LanguageProvider>
    </ThemeProvider>
  );
}
