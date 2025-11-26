/**
 * @fileoverview Componente de rodapé da aplicação
 * @description Footer com informações sobre o projeto, status
 * de funcionalidades e créditos da equipe.
 * 
 * @module components/layout/Footer
 */

// ==================== COMPONENTE ====================

/**
 * Componente de rodapé da aplicação
 * 
 * @description Footer responsivo dividido em três seções:
 * - Sobre: Descrição do projeto Formula Info
 * - Status: Lista de funcionalidades e disponibilidade
 * - Equipe: Créditos dos desenvolvedores
 * 
 * Inclui também uma seção de copyright no final.
 * 
 * @returns {JSX.Element} Footer estilizado
 * 
 * @example
 * // No layout principal
 * <Footer />
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 space-y-10">
        {/* Grid de informações */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Seção Sobre */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Sobre</h3>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Formula Info é um portal em desenvolvimento focado em centralizar informações essenciais sobre o mundo da Fórmula 1.
              Nossa missão é oferecer dados de pilotos, estatísticas e histórico de forma simples e acessível.
            </p>
          </div>
          
          {/* Seção Status */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Status</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>Pilotos em atividade: Disponível</li>
              <li>Estatísticas da temporada: Em breve</li>
              <li>Histórico de corridas: Em breve</li>
            </ul>
          </div>
          
          {/* Seção Equipe */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">Equipe</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>Alexandre Augusto Tescaro Oliveira</li>
              <li>Felipe Dias Konda</li>
              <li>Hugo Tahara Menegatti</li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 md:flex-row">
          <p className="text-xs leading-5 text-gray-500">&copy; 2025 Formula Info. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-600">Feito com <span className="text-red-500">❤</span> por entusiastas de F1.</p>
        </div>
      </div>
    </footer>
  )
}