import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Loader2,
  Mail,
  ArrowRight,
  BookOpen,
  Globe,
  Check
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useLanguage } from '../../../providers/LanguageContext';
import { ModeToggle } from "../../../components/ui/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import type { AuthView } from "../../../types/auth";

interface SignInPageProps {
  onNavigate: (view: AuthView) => void;
  onLogin: () => void;
}

export const SignInPage = ({
  onNavigate,
  onLogin,
}: SignInPageProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
      toast.success(t('auth.success_magic_link'));

      // In a real app, the user would click the link in their email.
      // Here we'll simulate the login happening after a delay or just let them stay on the "email sent" screen
      // For this demo, we'll auto-login after 2 seconds to show the flow
      setTimeout(() => {
        onLogin();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative">
      {/* Theme & Language Switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'English' : 'Português'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
              <span>English</span>
              {language === 'en' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('pt')} className="gap-2">
              <span>Português</span>
              {language === 'pt' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.welcome')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t('auth.subtitle')}
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle>
              {emailSent
                ? t('auth.check_inbox')
                : t('auth.sign_in')}
            </CardTitle>
            <CardDescription>
              {emailSent
                ? t('auth.email_sent').replace('{email}', email)
                : t('auth.enter_email')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email_label')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.email_placeholder')}
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.sending')}
                    </>
                  ) : (
                    <>
                      {t('auth.send_link')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('auth.cant_find')}{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-blue-600 hover:underline"
                  >
                    {t('auth.try_another')}
                  </button>
                  .
                </p>
                <div className="pt-2">
                  <p className="text-xs text-slate-400 animate-pulse">
                    {t('auth.redirecting')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('auth.no_account')}{" "}
              <button
                onClick={() => onNavigate("signup")}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
              >
                {t('auth.sign_up')}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};