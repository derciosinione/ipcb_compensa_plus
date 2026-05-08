import { UserProfile } from './components/UserProfile';
import { User } from '../../mocks/data';

interface ProfilePageProps {
  user: User;
}

export const ProfilePage = ({ user }: ProfilePageProps) => <UserProfile user={user} />;
