
'use client';
import { useAuth, useAdminAuth } from '@/src/hooks/authHooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseRequireAuthOptions {
  requiredRole?: 'admin' | 'author';
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const { requiredRole, redirectTo = '/admin/login', onUnauthorized } = options;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isAuthor } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (requiredRole && user) {
      const hasRole = requiredRole === 'admin' 
        ? isAdmin 
        : (isAdmin || isAuthor);

      if (!hasRole) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          router.push('/admin/unauthorized');
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, redirectTo, onUnauthorized, router, isAdmin, isAuthor]);

  return {
    isAuthenticated,
    isLoading,
    user,
    hasAccess: isAuthenticated && (!requiredRole || (user && (
      requiredRole === 'admin' ? isAdmin : (isAdmin || isAuthor)
    ))),
  };
};