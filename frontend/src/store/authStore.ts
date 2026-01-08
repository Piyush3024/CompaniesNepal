import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "../lib/axios";
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthState,
  VerifyEmailResponse,
  ResendVerificationResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "../types/authType";

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const skipRefreshPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh-token",
      "/api/auth/logout",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/verify",
      "/api/auth/resend-verification",
    ];

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefreshPaths.some((path) => originalRequest.url?.includes(path))
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post("/api/auth/refresh-token");

        if (response.data.success) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isBlocked: false,
        });

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
       
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerified: null,
        isBlocked: false,
        blockedUntil: undefined,

        // Login action
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<AuthResponse>(
              "/api/auth/login",
              credentials
            );

            const { data, success, message, blocked_until } = response.data;

            if (success && data) {
              set({
                user: data,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                isVerified: data.email_verified,
                isBlocked: false,
              });

              return response.data;
            } else {
              set({
                isLoading: false,
                error: message || "Login failed",
              });
              return response.data;
            }
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Login failed";
            const isBlocked = error.response?.status === 403;
            const blockedUntil = error.response?.data?.blocked_until;

            set({
              isLoading: false,
              error: errorMessage,
              isAuthenticated: false,
              user: null,
              isBlocked,
              blockedUntil: blockedUntil ? new Date(blockedUntil) : undefined,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Register action
        register: async (data: RegisterData) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<AuthResponse>(
              "/api/auth/register",
              data
            );

            const { success, message } = response.data;

            set({ isLoading: false });

            if (!success) {
              set({ error: message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Registration failed";
            set({
              isLoading: false,
              error: errorMessage,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Logout action
        logout: async () => {
          const { isAuthenticated } = get();
          set({ isLoading: true });

          if (isAuthenticated) {
            try {
              await api.post("/api/auth/logout");
            } catch (error) {
              console.error("Logout error:", error);
            }
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isVerified: null,
            isBlocked: false,
            blockedUntil: undefined,
          });
        },

        // Get profile
        getProfile: async () => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.get<AuthResponse>("/api/auth/profile");

            if (response.data.success && response.data.data) {
              set({
                user: response.data.data,
                isAuthenticated: true,
                isLoading: false,
                isVerified: response.data.data.email_verified,
              });

              return response.data;
            } else {
              throw new Error("Failed to fetch profile");
            }
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch profile";
            set({
              isLoading: false,
              error: errorMessage,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Verify email
        verifyEmail: async (token: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.get<VerifyEmailResponse>(
              `/api/auth/verify/${token}`
            );

            if (response.data.success) {
              set({
                isLoading: false,
                isVerified: true,
              });

              // If user is logged in, update their verification status
              const { user } = get();
              if (user) {
                set({
                  user: {
                    ...user,
                    email_verified: true,
                  },
                });
              }
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Email verification failed";
            set({
              isLoading: false,
              error: errorMessage,
              isVerified: false,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Resend verification email
        resendVerification: async (email: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<ResendVerificationResponse>(
              "/api/auth/resend-verification",
              { email }
            );

            set({ isLoading: false });

            return {
              success: response.data.success,
              message: response.data.message,
            };
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              "Failed to resend verification email";
            set({
              isLoading: false,
              error: errorMessage,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Forgot password
        forgotPassword: async (email: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<ForgotPasswordResponse>(
              "/api/auth/forgot-password",
              { email }
            );

            set({ isLoading: false });

            return {
              success: response.data.success,
              message: response.data.message,
            };
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to send reset email";
            set({
              isLoading: false,
              error: errorMessage,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Reset password with token
        resetPassword: async (token: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<ResetPasswordResponse>(
              `/api/auth/reset-password/${token}`,
              { password }
            );

            set({ isLoading: false });

            return {
              success: response.data.success,
              message: response.data.message,
            };
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Password reset failed";
            set({
              isLoading: false,
              error: errorMessage,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Check authentication status
        checkAuth: async () => {
          set({ isLoading: true });

          try {
            const response = await api.get("/api/auth/profile");

            if (response.data.success && response.data.data) {
              set({
                user: response.data.data,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                isVerified: response.data.data.email_verified,
              });
            } else {
              throw new Error("Invalid response");
            }
          } catch (error) {
            console.error("Check auth error:", error);
            const refreshSuccess = await get().refreshToken();
            if (!refreshSuccess) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                isVerified: null,
                isBlocked: false,
              });
            }
          }
        },

        // Refresh token
        refreshToken: async () => {
          try {
            const response = await api.post("/api/auth/refresh-token");

            if (response.data.success && response.data.data) {
              set({
                user: response.data.data,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              return true;
            } else {
              throw new Error("Refresh failed");
            }
          } catch (error) {
            console.error("Refresh token error:", error);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              isBlocked: false,
            });

            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }

            return false;
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isVerified: state.isVerified,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);