/**
 * @fileoverview Página 404 - Não Encontrado
 * @description Página customizada de erro 404 exibida quando o usuário
 * acessa uma rota inexistente. Oferece navegação de volta à página inicial.
 */

import Link from 'next/link'

/**
 * Componente de página não encontrada (404).
 * 
 * @description Exibe mensagem amigável quando o usuário acessa uma URL
 * que não existe na aplicação. Inclui código de erro visual, descrição
 * do problema e link para retornar à página inicial.
 * 
 * @returns {JSX.Element} Página 404 com opção de voltar para home
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      {/* Código de erro em destaque */}
      <h1 className="text-5xl font-extrabold tracking-tight text-red-600">404</h1>
      
      {/* Mensagem de erro */}
      <p className="mt-4 text-lg text-gray-600">Página não encontrada.</p>
      <p className="mt-2 text-sm text-gray-500 max-w-md">A URL pode ter sido alterada ou removida. Verifique se você digitou o endereço corretamente.</p>
      
      {/* Botão de navegação */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          Voltar para a Home
        </Link>
      </div>
    </main>
  )
}
