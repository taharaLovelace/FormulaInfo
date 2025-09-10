export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 space-y-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Sobre</h3>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Formula Info é um portal em desenvolvimento focado em centralizar informações essenciais sobre o mundo da Fórmula 1.
              Nossa missão é oferecer dados de pilotos, estatísticas e histórico de forma simples e acessível.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Status</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>Pilotos em atividade: Disponível</li>
              <li>Estatísticas da temporada: Em breve</li>
              <li>Histórico de corridas: Em breve</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Equipe</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>Alexandre Augusto Tescaro Oliveira</li>
              <li>Felipe Dias Konda</li>
              <li>Hugo Tahara Menegatti</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 md:flex-row">
          <p className="text-xs leading-5 text-gray-500">&copy; 2025 Formula Info. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-600">Feito com <span className="text-red-500">❤</span> por entusiastas de F1.</p>
        </div>
      </div>
    </footer>
  )
}
