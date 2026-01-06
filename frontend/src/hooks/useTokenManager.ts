"use client";
import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

// Hook for automatic token refresh management
export const useTokenManager = () => {
  const { refreshToken, isAuthenticated, logout } = useAuthStore();
  const refreshTimerRef = useRef<NodeJS.Timeout>();
  const isRefreshingRef = useRef(false);

  // Function to schedule token refresh
  const scheduleTokenRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Schedule refresh for 25 minutes (5 minutes before 30-minute expiry)
    const refreshTime = 25 * 60 * 1000; // 25 minutes in milliseconds

    refreshTimerRef.current = setTimeout(async () => {
      if (!isRefreshingRef.current && isAuthenticated) {
        isRefreshingRef.current = true;
        
        try {
          const success = await refreshToken();
          if (success) {
            // Schedule next refresh
            scheduleTokenRefresh();
          }
        } catch (error) {
          console.error('Scheduled token refresh failed:', error);
          logout();
        } finally {
          isRefreshingRef.current = false;
        }
      }
    }, refreshTime);
  }, [refreshToken, isAuthenticated, logout]);

  // Start token management when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      scheduleTokenRefresh();
    } else {
      // Clear timer when not authenticated
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    }

    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, scheduleTokenRefresh]);

  // Handle visibility change to refresh token when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        
        try {
          await refreshToken();
          scheduleTokenRefresh(); // Reschedule after manual refresh
        } catch (error) {
          console.error('Visibility change token refresh failed:', error);
        } finally {
          isRefreshingRef.current = false;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshToken, scheduleTokenRefresh]);

  return {
    scheduleTokenRefresh,
    isRefreshing: isRefreshingRef.current,
  };
};

// hooks/useAuthPersistence.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Hook to handle auth persistence and initialization
export const useAuthPersistence = () => {
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    // Only check auth if we have persisted data
    const persistedState = localStorage.getItem('auth-storage');
    
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState);
        if (parsed.state?.isAuthenticated && parsed.state?.user) {
          checkAuth();
        }
      } catch (error) {
        console.error('Failed to parse persisted auth state:', error);
        localStorage.removeItem('auth-storage');
      }
    }
  }, [checkAuth]);

  return {
    isInitialized: true, // You might want to add an initialization state
    isAuthenticated,
    user,
  };
};

// hooks/useSessionTimeout.ts
import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface UseSessionTimeoutOptions {
  timeoutDuration?: number; // in milliseconds
  warningDuration?: number; // in milliseconds
  onTimeout?: () => void;
  onWarning?: (remainingTime: number) => void;
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const {
    timeoutDuration = 30 * 60 * 1000, // 30 minutes
    warningDuration = 5 * 60 * 1000,  // 5 minutes
    onTimeout,
    onWarning,
  } = options;

  const { logout, isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  // Reset session timeout
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!isAuthenticated) return;

    // Set warning timeout
    warningRef.current = setTimeout(() => {
      const remainingTime = timeoutDuration - warningDuration;
      onWarning?.(remainingTime);
    }, timeoutDuration - warningDuration);

    // Set session timeout
    timeoutRef.current = setTimeout(() => {
      onTimeout?.();
      logout();
    }, timeoutDuration);
  }, [isAuthenticated, logout, onTimeout, onWarning, timeoutDuration, warningDuration]);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timeout setup
    if (isAuthenticated) {
      resetTimeout();
    }

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      // Clear timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAuthenticated, resetTimeout]);

  return {
    resetTimeout,
    lastActivity: lastActivityRef.current,
  };
};

// components/AuthProvider.tsx
import React, { ReactNode } from 'react';
import { useTokenManager } from '@/hooks/useTokenManager';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize auth persistence
  useAuthPersistence();
  
  // Start token management
  useTokenManager();
  
  // Optional: Session timeout management
  // useSessionTimeout({
  //   onWarning: (remainingTime) => {
  //     console.log(`Session expires in ${remainingTime}ms`);
  //     // Show warning toast/modal
  //   },
  //   onTimeout: () => {
  //     console.log('Session expired');
  //     // Show session expired message
  //   }
  // });

  return <>{children}</>;
};

// lib/auth-utils.ts - Additional auth utilities
export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
} as const;

// Function to check if refresh is needed
export const shouldRefreshToken = (lastRefresh: number): boolean => {
  const now = Date.now();
  const timeSinceRefresh = now - lastRefresh;
  return timeSinceRefresh >= (AUTH_CONFIG.ACCESS_TOKEN_EXPIRY - AUTH_CONFIG.REFRESH_THRESHOLD);
};

// Function to handle auth errors
export const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired or invalid
    useAuthStore.getState().logout();
    
    // Redirect to login if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/')) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  } else if (error.response?.status === 403) {
    // Insufficient permissions
    console.error('Access denied:', error.response.data.message);
    
    // You might want to show a toast or redirect to a "not authorized" page
    if (typeof window !== 'undefined') {
      // Show error message or redirect
      console.error('Insufficient permissions');
    }
  }
};

// Function to get auth headers (if you need them for non-cookie requests)
export const getAuthHeaders = (): Record<string, string> => {
  // Since you're using HTTP-only cookies, you typically don't need to manually set headers
  // But if you ever need to send tokens in headers, this is how you'd do it
  return {
    'Content-Type': 'application/json',
    // Don't manually set Authorization header when using HTTP-only cookies
  };
};