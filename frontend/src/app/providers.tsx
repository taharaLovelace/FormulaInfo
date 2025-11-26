/**
 * @fileoverview Providers Globais da Aplicação
 * @description Componente que agrupa todos os providers necessários para a aplicação,
 * incluindo React Query para gerenciamento de cache, Toaster para notificações
 * e inicializador de autenticação.
 */

'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import AuthInitializer from '../components/auth/AuthInitializer'

/**
 * Componente de providers globais da aplicação.
 * 
 * @description Encapsula a aplicação com os seguintes providers:
 * - QueryClientProvider: Gerenciamento de cache e estado do servidor (React Query)
 * - AuthInitializer: Restauração automática do estado de autenticação
 * - Toaster: Sistema de notificações toast
 * - ReactQueryDevtools: Ferramentas de debug (apenas em desenvolvimento)
 * 
 * Configurações do React Query:
 * - staleTime: 5 minutos - tempo até dados serem considerados obsoletos
 * - cacheTime: 10 minutos - tempo de retenção do cache
 * - refetchOnWindowFocus: desabilitado para evitar requisições desnecessárias
 * - retry: até 3 tentativas, exceto para erros 404
 * 
 * @param {Object} props - Props do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem envolvidos
 * @returns {JSX.Element} Árvore de providers com os filhos
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Cria instância do QueryClient com configurações otimizadas
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            cacheTime: 1000 * 60 * 10, // 10 minutos
            refetchOnWindowFocus: false,
            // Retry inteligente: não tenta novamente em 404
            retry: (failureCount, error: any) => {
              if (error?.response?.status === 404) return false
              return failureCount < 3
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {/* Inicializa estado de autenticação ao carregar a app */}
      <AuthInitializer />
      
      {children}
      
      {/* Sistema de notificações toast com estilo customizado */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981', // Verde para sucesso
            },
          },
          error: {
            style: {
              background: '#EF4444', // Vermelho para erro
            },
          },
        }}
      />
      
      {/* DevTools do React Query - visível apenas em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
