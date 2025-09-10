'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // implementar posteriormente um serviço de logging de erros
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-gray-50">
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Algo deu errado</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-md">Ocorreu um erro inesperado ao carregar esta página.</p>
          {error?.message && (
            <p className="mt-4 rounded bg-red-50 px-4 py-2 text-xs text-red-600 border border-red-200 max-w-md break-words">
              {error.message}
            </p>
          )}
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
          {error?.digest && <p className="mt-4 text-[10px] text-gray-400">ID: {error.digest}</p>}
        </main>
      </body>
    </html>
  )
}
