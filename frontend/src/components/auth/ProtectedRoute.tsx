/**
 * @fileoverview Componente de rota protegida
 * @description Wrapper que protege rotas que requerem autenticação.
 * Redireciona automaticamente para login se não autenticado.
 * 
 * @module components/auth/ProtectedRoute
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/auth.store';

// ==================== INTERFACES ====================

/**
 * Props do componente ProtectedRoute
 * @interface ProtectedRouteProps
 */
interface ProtectedRouteProps {
  /** Conteúdo a ser renderizado se autenticado */
  children: ReactNode;
  /** URL para redirecionamento se não autenticado (padrão: /auth/login) */
  redirectTo?: string;
}

// ==================== COMPONENTE ====================

/**
 * Componente de rota protegida
 * 
 * @description Protege rotas que requerem autenticação:
 * - Verifica estado de autenticação
 * - Exibe loading durante verificação
 * - Redireciona para login se não autenticado
 * - Renderiza children se autenticado
 * 
 * @param {ProtectedRouteProps} props - Props do componente
 * @returns {JSX.Element | null} Conteúdo protegido ou null durante redirecionamento
 * 
 * @example
 * // Proteger uma página
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 * 
 * @example
 * // Com URL de redirecionamento personalizada
 * <ProtectedRoute redirectTo="/custom-login">
 *   <SecretPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasInitialized, initialize } = useAuthStore();
  const router = useRouter();

  // Inicializa o estado de autenticação quando o componente é montado
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redireciona se não autenticado após inicialização
  useEffect(() => {
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

  // Exibe loading enquanto verifica a autenticação
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