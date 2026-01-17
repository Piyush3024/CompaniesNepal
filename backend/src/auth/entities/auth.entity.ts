export class Auth {
  id: number;
  email: string;
  password: string;
  username: string;
  phone: string | null;
  profile_picture: string | null;
  role_id: number;
  status_id: number;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_expires_at: Date | null;
  password_reset_token: string | null;
  password_reset_expires_at: Date | null;
  last_login_at: Date | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  areasId: number | null;
}

export class UserResponse {
  id: string;
  email: string;
  username: string;
  phone: string | null;
  role_id: string;
  status_id: string;
  email_verified: boolean;
  created_at: Date;
  areasId: string | null;
}