/**
 * @fileoverview Componente de Loading Global
 * @description Componente de carregamento do Next.js exibido automaticamente
 * durante transições de página e carregamento de dados assíncronos.
 * Apresenta animação temática de F1 para melhor experiência do usuário.
 */

'use client'

/**
 * Componente de loading global da aplicação.
 * 
 * @description Exibe uma animação de carregamento com tema de F1
 * incluindo emoji de carro e bandeira quadriculada animados.
 * Renderizado automaticamente pelo Next.js durante navegação.
 * 
 * @returns {JSX.Element} Componente de loading com animação temática
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6">
      {/* Ícone animado do carro de F1 */}
      <div className="relative flex items-center justify-center">
        <span className="text-4xl animate-pulse" role="img" aria-label="Carro de Fórmula 1">🏎️</span>
      </div>
      
      {/* Textos de loading com bandeira animada */}
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-red-600 flex items-center justify-center gap-2">
          <span className="inline-block animate-spin-slow">🏁</span>
          Carregando conteúdo...
        </p>
        <p className="text-xs text-gray-400">Aguarde um instante</p>
      </div>
      
      {/* Animação customizada para rotação lenta */}
      <style jsx>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
      `}</style>
    </div>
  )
}
