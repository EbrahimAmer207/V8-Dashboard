'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loading } from '@/components/common';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Single role or list of allowed roles */
  requiredRole?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allowed = Array.isArray(requiredRole)
    ? requiredRole.map((r) => r.toUpperCase())
    : requiredRole
      ? [requiredRole.toUpperCase()]
      : null;

  const userRoleUpper = user?.role?.toUpperCase();

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (mounted && allowed && userRoleUpper && !allowed.includes(userRoleUpper)) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, userRoleUpper, allowed, router]);

  // Always render loading on server or until mounted to prevent hydration mismatch
  if (!mounted || !isAuthenticated) {
    return <Loading fullScreen />;
  }

  if (allowed && userRoleUpper && !allowed.includes(userRoleUpper)) {
    return <Loading fullScreen />;
  }

  return <>{children}</>;
};
