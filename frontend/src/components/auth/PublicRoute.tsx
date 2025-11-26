/**
 * @fileoverview Componente de rota pública
 * @description Wrapper para rotas que devem ser acessíveis apenas
 * por usuários NÃO autenticados (ex: login, registro).
 * 
 * @module components/auth/PublicRoute
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/auth.store';

// ==================== INTERFACES ====================

/**
 * Props do componente PublicRoute
 * @interface PublicRouteProps
 */
interface PublicRouteProps {
  /** Conteúdo a ser renderizado se NÃO autenticado */
  children: ReactNode;
  /** URL para redirecionamento se autenticado (padrão: /) */
  redirectTo?: string;
}

// ==================== COMPONENTE ====================

/**
 * Componente de rota pública (apenas não autenticados)
 * 
 * @description Protege rotas de autenticação de usuários já logados:
 * - Redireciona para home se já autenticado
 * - Exibe loading durante verificação
 * - Renderiza children se não autenticado
 * 
 * Útil para páginas de login e registro que não devem ser
 * acessadas por usuários já autenticados.
 * 
 * @param {PublicRouteProps} props - Props do componente
 * @returns {JSX.Element | null} Conteúdo ou null durante redirecionamento
 * 
 * @example
 * // Proteger página de login
 * <PublicRoute>
 *   <LoginForm />
 * </PublicRoute>
 * 
 * @example
 * // Com URL de redirecionamento personalizada
 * <PublicRoute redirectTo="/dashboard">
 *   <RegisterForm />
 * </PublicRoute>
 */
export default function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated, isLoading, hasInitialized, initialize } = useAuthStore();
  const router = useRouter();

  // Inicializa o estado de autenticação
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redireciona se já autenticado
  useEffect(() => {
    if (
      isAuthenticated &&
      typeof window !== 'undefined' &&
      window.location.pathname !== redirectTo
    ) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  // Se autenticado, não renderiza nada (vai redirecionar)
  if (isAuthenticated) {
    return null;
  }

  // Exibe loading durante verificação
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

  // Se não autenticado, renderiza o conteúdo
  return <>{children}</>;
}