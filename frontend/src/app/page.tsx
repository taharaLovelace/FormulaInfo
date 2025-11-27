/**
 * @fileoverview Página inicial do Formula Info
 * @description Landing page com hero banner e grid de pilotos em destaque.
 * 
 * @module app/page
 */

import { Hero } from '@/components/home/Hero'
import { FeaturedDrivers } from '@/components/home/FeaturedDrivers'

// ==================== PÁGINA ====================

/**
 * Página inicial da aplicação
 * 
 * @description Renderiza:
 * - Hero: Banner principal com título e descrição
 * - FeaturedDrivers: Grid com todos os pilotos ativos
 * 
 * @returns {JSX.Element} Página inicial
 */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedDrivers />
    </div>
  )
}