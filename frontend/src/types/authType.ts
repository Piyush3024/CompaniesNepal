
export interface Role {
  role_id: string;
  name: string;
}

export interface Status {
  status_id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  profile_picture?: string;
  role_id: string;
  status_id: string;
  email_verified: boolean;
  is_blocked: boolean;
  oauth_id?: string;
  oauth_provider?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  role: Role;
  status?: Status;
}


export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface VerifyEmailData {
  token: string;
}


export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
  redirectTo?: string;
  blocked_until?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface AuthError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}


export interface AuthState {
 
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isVerified: boolean | null;
  isBlocked: boolean;
  blockedUntil?: Date;

  
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getProfile: () => Promise<AuthResponse>;
  verifyEmail: (token: string) => Promise<VerifyEmailResponse>;
  resendVerification: (email: string) => Promise<ResendVerificationResponse>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (token: string, password: string) => Promise<ResetPasswordResponse>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}