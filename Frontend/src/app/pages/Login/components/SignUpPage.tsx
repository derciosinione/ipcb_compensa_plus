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
  User,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { AuthView } from "../../../types/auth";

interface SignUpPageProps {
  onNavigate: (view: AuthView) => void;
  onLogin: () => void;
}

export const SignUpPage = ({
  onNavigate,
  onLogin,
}: SignUpPageProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
      toast.success("Account created! Verification link sent.");

      // Simulate auto-login for demo
      setTimeout(() => {
        onLogin();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Join Compensa+ for academic management
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle>
              {emailSent ? "Check your inbox" : "Sign up"}
            </CardTitle>
            <CardDescription>
              {emailSent
                ? `We've sent a verification link to ${email}. Click the link to complete your registration.`
                : "Enter your details to create a new account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@university.edu"
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
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
                  Can't find it? Check your spam folder or{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-blue-600 hover:underline"
                  >
                    try again
                  </button>
                  .
                </p>
                <div className="pt-2">
                  <p className="text-xs text-slate-400 animate-pulse">
                    Redirecting you to dashboard...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <button
                onClick={() => onNavigate("signin")}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};