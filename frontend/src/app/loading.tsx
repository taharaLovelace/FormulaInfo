'use client'

export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6">
      <div className="relative flex items-center justify-center">
        <span className="text-4xl animate-pulse" role="img" aria-label="Carro de Fórmula 1">🏎️</span>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-red-600 flex items-center justify-center gap-2">
          <span className="inline-block animate-spin-slow">🏁</span>
          Carregando conteúdo...
        </p>
        <p className="text-xs text-gray-400">Aguarde um instante</p>
      </div>
      <style jsx>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
      `}</style>
    </div>
  )
}
