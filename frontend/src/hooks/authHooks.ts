import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";


export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isVerified,
    isBlocked,
    blockedUntil,
    login,
    logout,
    register,
    clearError,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    getProfile,
    checkAuth,
    refreshToken,
  } = useAuthStore();

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    isVerified,
    isBlocked,
    blockedUntil,

    // Actions
    login,
    logout,
    register,
    clearError,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    getProfile,
    checkAuth,
    refreshToken,
  };
};

// For the Role Based Authorization

// export const useAuthRole = () => {
//   const { user } = useAuthStore();

//   return {
//     isAdmin: user?.role_id === 1, 
//     isSeller: user?.role_id === 2,
//     isUser: user?.role_id === 3,
//     userRole: user?.role,
//     canManageUsers: user?.role_id === 1,
//     canManageContent: user?.role_id === 1 || user?.role_id === 2,
//   };
// };


export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  return {
    isAuthenticated,
    isLoading,
  };
};


export const useEmailVerification = () => {
  const { isVerified, user } = useAuthStore();

  return {
    isEmailVerified: isVerified || user?.email_verified,
    needsVerification: !isVerified && !user?.email_verified,
  };
};


export const useAccountStatus = () => {
  const { isBlocked, blockedUntil, user } = useAuthStore();

  const isAccountBlocked = isBlocked || user?.is_blocked;
  const blockExpiration = blockedUntil;

  return {
    isBlocked: isAccountBlocked,
    blockedUntil: blockExpiration,
    isBlockExpired:
      blockExpiration && new Date() > new Date(blockExpiration)
        ? true
        : false,
  };
};

/**
 * Hook to initialize auth on app load
 * Call this in  root component (App.tsx or layout)
 */
export const useInitializeAuth = () => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Only check auth if we have persisted auth data
      const persistedState = JSON.parse(
        localStorage.getItem("auth-storage") || "{}"
      );

      if (persistedState.state?.isAuthenticated) {
        await checkAuth();
      }
    };

    initAuth();
  }, [checkAuth]);

  return { isLoading };
};


export const usePasswordReset = () => {
  const { forgotPassword, resetPassword, isLoading, error } = useAuthStore();

  const requestPasswordReset = async (email: string) => {
    return await forgotPassword(email);
  };

  const confirmPasswordReset = async (token: string, password: string) => {
    return await resetPassword(token, password);
  };

  return {
    requestPasswordReset,
    confirmPasswordReset,
    isLoading,
    error,
  };
};


export const useEmailVerificationFlow = () => {
  const { verifyEmail, resendVerification, isLoading, error } = useAuthStore();

  const verify = async (token: string) => {
    return await verifyEmail(token);
  };

  const resend = async (email: string) => {
    return await resendVerification(email);
  };

  return {
    verify,
    resend,
    isLoading,
    error,
  };
};