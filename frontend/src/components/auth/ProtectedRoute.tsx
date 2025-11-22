'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasInitialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Inicializa o estado de autenticação quando o componente é montado
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Só redireciona se não está carregando E não está autenticado
    // E se não estamos já na página de login para evitar loops
    if (
      hasInitialized &&
      !isLoading &&
      !isAuthenticated &&
      typeof window !== 'undefined' &&
      window.location.pathname !== redirectTo
    ) {
      router.push(redirectTo);
    }
  }, [hasInitialized, isAuthenticated, isLoading, router, redirectTo]);

  // Mostra loading enquanto verifica a autenticação
  if (isLoading || !hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada (vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  // Se estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
}