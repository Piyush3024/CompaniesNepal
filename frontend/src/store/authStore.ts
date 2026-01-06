import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "../lib/axios";
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  AuthError,
  AuthState,
} from "../types/authType";

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any default headers if needed
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
      "/api/auth/refresh-token",
      "/api/auth/logout",
    ];

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefreshPaths.some((path) => originalRequest.url?.includes(path))
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await api.post("/api/auth/refresh-token");

        if (response.data.success) {
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          requiresPasswordReset: false,
        });
        // Optional: Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/";
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
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresPasswordReset: false,

        // Login action
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<AuthResponse>(
              "/api/auth/login",
              credentials
            );
            const { data, success, message, requiresPasswordReset } =
              response.data;

            if (success && data) {
              set({
                user: data,
                isAuthenticated: true,
                isLoading: false,
                requiresPasswordReset: requiresPasswordReset || false,
                error: null,
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
            set({
              isLoading: false,
              error: errorMessage,
              isAuthenticated: false,
              user: null,
            });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        // Register action (admin only)
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
        // logout: async () => {
        //   set({ isLoading: true });

        //   try {
        //     await api.post("/api/auth/logout");
        //   } catch (error) {
        //     console.error("Logout error:", error);
        //   } finally {
        //     set({
        //       user: null,
        //       isAuthenticated: false,
        //       isLoading: false,
        //       error: null,
        //       requiresPasswordReset: false,
        //     });
        //   }
        // },

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
            requiresPasswordReset: false,
          });
        },
        // Set password (for temporary passwords)
        setPassword: async (newPassword: string) => {
          console.log("SET PASSWORD: ", newPassword);
          set({ isLoading: true, error: null });

          try {
            const response = await api.post<AuthResponse>("/api/auth/reset", {
              newPassword,
            });

            const { success, message, data } = response.data;

            if (success && data) {
              set({
                user: { ...data, isTemporaryPassword: false },
                requiresPasswordReset: false,
                isLoading: false,
                error: null,
              });
            } else {
              set({
                isLoading: false,
                error: message || "Password reset failed",
              });
            }

            return response.data;
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

        // Forgot password
        forgotPassword: async (email: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.post("/api/auth/forgot", { email });
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
            const response = await api.post(
              `/api/auth/reset-password/${token}`,
              {
                password,
              }
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
            // Try to make an authenticated request to verify token
            const response = await api.get("/api/auth/me");

            if (response.data.success && response.data.data) {
              set({
                user: response.data.data,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                requiresPasswordReset:
                  response.data.data.isTemporaryPassword || false,
              });
            } else {
              throw new Error("Invalid response");
            }
          } catch (error) {
            // If verification fails, try to refresh token first
            const refreshSuccess = await get().refreshToken();
            if (!refreshSuccess) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                requiresPasswordReset: false,
                error: null,
              });
            }
          }
        },

        // Refresh token
        refreshToken: async () => {
          try {
            const response = await api.post("/api/auth/refresh-token");

            if (response.data.success && response.data.data) {
              // Update user data with refreshed info
              set({
                user: response.data.data,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                requiresPasswordReset:
                  response.data.data.isTemporaryPassword || false,
              });
              return true;
            } else {
              throw new Error("Refresh failed");
            }
          } catch (error) {
            // Refresh failed, clear auth state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              requiresPasswordReset: false,
              error: null,
            });

            // Redirect to login if we're in the browser
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }

            return false;
          }
        },
      }),
      {
        name: "auth-storage", // Storage key
        partialize: (state) => ({
          // Only persist these fields
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          requiresPasswordReset: state.requiresPasswordReset,
        }),
      }
    ),
    {
      name: "auth-store", // DevTools name
    }
  )
);
