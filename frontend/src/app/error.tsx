/**
 * @fileoverview Página de Erro Global
 * @description Componente de erro global do Next.js que é exibido quando ocorre
 * um erro não tratado em qualquer parte da aplicação. Fornece feedback visual
 * e opções de recuperação para o usuário.
 */

'use client'
import { useEffect } from 'react'

/**
 * Componente de erro global da aplicação.
 * 
 * @description Exibe uma página de erro amigável quando ocorre uma exceção
 * não tratada. Mostra a mensagem de erro, digest ID para debug e oferece
 * opções de recuperação (tentar novamente ou voltar para home).
 * 
 * @param {Object} props - Props do componente
 * @param {Error & { digest?: string }} props.error - Objeto de erro com digest opcional
 * @param {() => void} props.reset - Função para resetar o estado de erro
 * @returns {JSX.Element} Página de erro com opções de recuperação
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  // Hook para logging de erros - pode ser integrado com serviço de monitoramento
  useEffect(() => {
    // TODO: Implementar serviço de logging de erros (ex: Sentry, LogRocket)
    console.error('Erro global capturado:', error);
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-gray-50">
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          {/* Título do erro */}
          <h1 className="text-2xl font-bold text-gray-900">Algo deu errado</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-md">Ocorreu um erro inesperado ao carregar esta página.</p>
          
          {/* Exibe mensagem de erro se disponível */}
          {error?.message && (
            <p className="mt-4 rounded bg-red-50 px-4 py-2 text-xs text-red-600 border border-red-200 max-w-md break-words">
              {error.message}
            </p>
          )}
          
          {/* Botões de ação para recuperação */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Tentar novamente
            </button>
            <a href="/" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500">
              Voltar para Home
            </a>
          </div>
          
          {/* Digest ID para debugging - útil em produção */}
          {error?.digest && <p className="mt-4 text-[10px] text-gray-400">ID: {error.digest}</p>}
        </main>
      </body>
    </html>
  )
}
