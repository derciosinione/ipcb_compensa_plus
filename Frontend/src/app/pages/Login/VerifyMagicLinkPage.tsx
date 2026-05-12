import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Loader2, MailCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { verifyMagicLink } from "../../services/auth/authApi";
import {
  mapSessionToUser,
  mapVerifyResponseToSession,
  saveAuthSession,
} from "../../services/auth/authSession";
import { appPaths } from "../../routes/paths";
import type { AuthenticatedUser } from "../../types/user";

interface VerifyMagicLinkPageProps {
  onAuthenticated: (user: AuthenticatedUser) => void;
}

export const VerifyMagicLinkPage = ({
  onAuthenticated,
}: VerifyMagicLinkPageProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    let isMounted = true;

    verifyMagicLink(token)
      .then((response) => {
        if (!response || !isMounted) return;

        const session = mapVerifyResponseToSession(response);
        saveAuthSession(session);
        onAuthenticated(mapSessionToUser(session));
        toast.success("Login completed.");
        navigate(appPaths.dashboard, { replace: true });
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, onAuthenticated, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "loading" ? (
              <MailCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <TriangleAlert className="h-5 w-5 text-red-600" />
            )}
            Verify magic link
          </CardTitle>
          <CardDescription>
            {status === "loading"
              ? "We are validating your access link."
              : "This link is invalid, expired, or already used."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing you in...
            </div>
          ) : (
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to={appPaths.login}>Request a new magic link</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
