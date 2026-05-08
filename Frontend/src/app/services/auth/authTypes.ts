export interface LoginResponse {
  email: string;
  magicLinkSent: boolean;
  devMagicLink?: string | null;
}

export interface VerifyMagicLinkResponse {
  userId: string;
  email?: string | null;
  fullName?: string | null;
  roles: string[];
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface AuthSession {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}
