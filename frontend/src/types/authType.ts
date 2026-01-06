// Types based on your backend
export interface User {
  id: string; // encoded ID from backend
  email: string;
  username: string;
  role: "admin" | "author";
  isTemporaryPassword?: boolean;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  role?: "admin" | "author";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requiresPasswordReset?: boolean;
  data?: User;
}

export interface AuthError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresPasswordReset: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setPassword: (newPassword: string) => Promise<AuthResponse>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}