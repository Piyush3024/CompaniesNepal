
export interface User {
  id: string; // encoded ID from backend
  email: string;
  username: string;
  role: 'admin' | 'author';
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
  role?: 'admin' | 'author';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requiresPasswordReset?: boolean;
  data?: User;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

export interface AuthError {
  success: false;
  message: string;
  errors?: ValidationError[];
  timestamp?: string;
}

// lib/api.ts
