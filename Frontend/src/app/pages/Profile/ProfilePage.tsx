import { UserProfile } from "./components/UserProfile";
import type { User } from "../../types/user";

interface ProfilePageProps {
  user: User;
}

export const ProfilePage = ({ user }: ProfilePageProps) => (
  <UserProfile user={user} />
);
