export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-f1-red to-orange-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Formula Info
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-100">
            Seu portal completo para o mundo da Fórmula 1. Estatísticas, perfis de pilotos, 
            histórico de corridas e tudo sobre o esporte mais emocionante do mundo.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/drivers"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-f1-red shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              Explorar Pilotos
            </a>
            <a 
              href="/races" 
              className="text-sm font-semibold leading-6 text-white hover:text-gray-100 transition-colors"
            >
              Ver Corridas <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
