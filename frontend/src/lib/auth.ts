
import axios from "axios";
import { User, ValidationError } from "./types";
import { ApiError } from "./api";

export const AUTH_ROLES = {
  ADMIN: 'admin' as const,
  AUTHOR: 'author' as const,
};

export const hasRole = (user: User | null, role: keyof typeof AUTH_ROLES): boolean => {
  return user?.role === AUTH_ROLES[role];
};

export const hasAnyRole = (user: User | null, roles: (keyof typeof AUTH_ROLES)[]): boolean => {
  return roles.some(role => hasRole(user, role));
};

export const canManageUsers = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

export const canManageContent = (user: User | null): boolean => {
  return hasAnyRole(user, ['ADMIN', 'AUTHOR']);
};

export const isAuthenticated = (user: User | null): boolean => {
  return user !== null;
};

export const requiresPasswordReset = (user: User | null): boolean => {
  return user?.isTemporaryPassword === true;
};

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || 'An unexpected error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getValidationErrors = (error: any): ValidationError[] => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.errors || [];
  }
  
  return [];
};

// Constants
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
export const MAX_RETRY_ATTEMPTS = 3;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;