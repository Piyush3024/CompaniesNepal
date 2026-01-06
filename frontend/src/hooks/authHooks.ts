import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    requiresPasswordReset,
    login,
    logout,
    clearError,
    setPassword,
    forgotPassword,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    requiresPasswordReset,
    login,
    logout,
    clearError,
    setPassword,
    forgotPassword,
  };
};

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuthStore();

  return {
    isAdmin: isAuthenticated && user?.role === "admin",
    isAuthor: isAuthenticated && user?.role === "author",
    canManageUsers: isAuthenticated && user?.role === "admin",
    canManageContent:
      isAuthenticated && ["admin", "author"].includes(user?.role || ""),
  };
};

// Auto-check authentication on app load
export const initializeAuth = () => {
  const { checkAuth } = useAuthStore.getState();

  // Only check auth if we have persisted auth data
  const persistedState = JSON.parse(
    localStorage.getItem("auth-storage") || "{}"
  );

  if (persistedState.state?.isAuthenticated) {
    checkAuth();
  }
};
