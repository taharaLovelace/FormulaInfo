'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/auth.store';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated, isLoading, hasInitialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (
      isAuthenticated &&
      typeof window !== 'undefined' &&
      window.location.pathname !== redirectTo
    ) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  if (isAuthenticated) {
    return null;
  }

  if (!isAuthenticated && (isLoading || !hasInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
