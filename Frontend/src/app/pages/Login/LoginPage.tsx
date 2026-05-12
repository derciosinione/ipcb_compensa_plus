import { SignInPage } from "./components/SignInPage";
import { SignUpPage } from "./components/SignUpPage";
import type { AuthView } from "../../types/auth";
import type { AuthenticatedUser } from "../../types/user";

interface LoginPageProps {
  authView: AuthView;
  onAuthViewChange: (view: AuthView) => void;
  onLogin: (user: AuthenticatedUser) => void;
}

export const LoginPage = ({
  authView,
  onAuthViewChange,
  onLogin,
}: LoginPageProps) => {
  return authView === "signin" ? (
    <SignInPage onNavigate={onAuthViewChange} onLogin={onLogin} />
  ) : (
    <SignUpPage onNavigate={onAuthViewChange} />
  );
};
