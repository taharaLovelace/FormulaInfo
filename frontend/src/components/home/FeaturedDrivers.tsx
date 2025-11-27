/**
 * @fileoverview Componente de pilotos em destaque
 * @description Grid de cards exibindo todos os pilotos ativos da F1.
 * 
 * @module components/home/FeaturedDrivers
 */

'use client'

import { useEffect, useState, useCallback } from 'react'

// ==================== INTERFACES ====================

/**
 * Representa um piloto de Fórmula 1
 * @interface Driver
 */
interface Driver {
  id: number
  driverNumber: number
  fullName: string
  firstName: string
  lastName: string
  /** Código ISO 2 do país (ex: "BR", "GB") */
  nationality: string
  teamName: string
  birthDate?: string
  bio?: string | null
  imageUrl?: string | null
  isActive: boolean
}

/**
 * Resposta da API de pilotos
 * @interface ApiResponse
 */
interface ApiResponse {
  success: true
  data: Driver[]
}

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Converte código ISO 2 para emoji de bandeira
 * @param {string} code - Código ISO 2 do país (ex: "BR")
 * @returns {string} Emoji da bandeira ou bandeira genérica se inválido
 * 
 * @example
 * flagFromIso2('BR') // 🇧🇷
 * flagFromIso2('GB') // 🇬🇧
 */
function flagFromIso2(code: string) {
  if (!code || code.length !== 2) return '🏳️'
  const base = 0x1f1e6
  return code.toUpperCase().split('').map(c => String.fromCodePoint(base + c.charCodeAt(0) - 65)).join('')
}

/**
 * Mapeamento de códigos ISO 2 para gentílicos em português
 * @constant
 */
const ISO2_PT_DEMONYM: Record<string, string> = {
  NL: 'Holandês',
  NZ: 'Neozelandês',
  MC: 'Monegasco',
  GB: 'Britânico',
  UK: 'Britânico',
  IT: 'Italiano',
  ES: 'Espanhol',
  CA: 'Canadense',
  AU: 'Australiano',
  JP: 'Japonês',
  FR: 'Francês',
  DE: 'Alemão',
  BR: 'Brasileiro',
  AR: 'Argentino',
  TH: 'Tailandês',
}

/**
 * Converte código ISO 2 para gentílico em português
 * @param {string} code - Código ISO 2 do país
 * @returns {string} Gentílico em português ou código original se não mapeado
 * 
 * @example
 * iso2ToPtDemonym('BR') // 'Brasileiro'
 * iso2ToPtDemonym('XX') // 'XX'
 */
function iso2ToPtDemonym(code: string) {
  return ISO2_PT_DEMONYM[code.toUpperCase()] || code.toUpperCase()
}

// ==================== COMPONENTE ====================

/**
 * Componente de pilotos em destaque
 * 
 * @description Exibe um grid responsivo com todos os pilotos ativos:
 * - Carrega dados da API /api/v1/drivers
 * - Exibe skeleton loader durante carregamento
 * - Mostra bandeira e gentílico de cada piloto
 * - Cards com hover effect e informações essenciais
 * 
 * @returns {JSX.Element} Grid de cards de pilotos
 * 
 * @example
 * // Na página inicial
 * <FeaturedDrivers />
 */
export function FeaturedDrivers() {
  /** Lista de pilotos carregados */
  const [drivers, setDrivers] = useState<Driver[]>([])
  /** Estado de carregamento */
  const [loading, setLoading] = useState(true)
  /** Mensagem de erro, se houver */
  const [error, setError] = useState<string | null>(null)
  /** Contador para forçar refresh (não utilizado atualmente) */
  const [refreshCounter, setRefreshCounter] = useState(0)

  /**
   * Carrega a lista de pilotos da API
   * @async
   */
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/v1/drivers`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json: ApiResponse = await res.json()
      setDrivers(json.data)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Falha ao carregar pilotos'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carrega pilotos na montagem do componente
  useEffect(() => { load() }, [load, refreshCounter])

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pilotos do Grid</h2>
            <p className="text-gray-600 text-sm">Lista atual de pilotos ativos</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Temporada 2025'}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Erro:</p>
            <p>{error}</p>
          </div>
        )}

        {loading && !drivers.length && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
                <div className="h-3 w-32 rounded bg-gray-200 mb-1" />
                <div className="h-3 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && drivers.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {drivers.map(d => {
              const flag = flagFromIso2(d.nationality)
              const demonym = iso2ToPtDemonym(d.nationality)
              return (
                <div key={d.id} className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-red-500">
                  <div className="relative mx-auto mb-4 h-20 w-20">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-4xl ring-2 ring-red-500">
                      <span aria-label={demonym}>{flag}</span>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">#{d.driverNumber}</p>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{d.fullName}</h3>
                    <p className="text-sm text-gray-600">{d.teamName}</p>
                    <p className="text-[11px] text-gray-400">{demonym}</p>
                  </div>
                  {d.bio && (
                    <p className="mt-3 flex-1 text-xs text-gray-500 overflow-hidden text-center" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical'}}>{d.bio}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!loading && !drivers.length && !error && (
          <p className="text-sm text-gray-600">Nenhum piloto encontrado.</p>
        )}
      </div>
    </section>
  )
}
