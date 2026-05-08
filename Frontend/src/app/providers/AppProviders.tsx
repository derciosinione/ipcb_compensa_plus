import React from 'react';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner@2.0.3';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from '../components/ui/theme-provider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="compensa-theme">
      <LanguageProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>{children}</BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};
