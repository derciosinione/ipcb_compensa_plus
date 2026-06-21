import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { Toaster, toast } from "sonner";
import { LanguageProvider } from "./LanguageContext";
import { ThemeProvider } from "../components/ui/theme-provider";
import { AcademicYearProvider } from "./AcademicYearContext";

// Patch toast.error and toast.warning to persist indefinitely until manually closed
try {
  const originalError = toast.error;
  toast.error = (message, options) => {
    return originalError(message, { duration: Infinity, ...options });
  };

  const originalWarning = toast.warning;
  toast.warning = (message, options) => {
    return originalWarning(message, { duration: Infinity, ...options });
  };
} catch (error) {
  console.error("Failed to patch toast error/warning methods", error);
}

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="compensa-theme">
        <LanguageProvider>
          <AcademicYearProvider>
            <Toaster richColors position="top-right" closeButton />
            <BrowserRouter>{children}</BrowserRouter>
          </AcademicYearProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
