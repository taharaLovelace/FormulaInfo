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
        </div>
      </div>
    </section>
  )
}
