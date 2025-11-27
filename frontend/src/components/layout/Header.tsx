/**
 * @fileoverview Componente de cabeçalho principal
 * @description Header responsivo com navegação, logo e autenticação.
 * Inclui menu mobile para dispositivos menores.
 * 
 * @module components/layout/Header
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import AuthHeader from '../auth/AuthHeader'

// ==================== CONFIGURAÇÃO ====================

/**
 * Links de navegação principal
 * @constant
 */
const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Pilotos', href: '/drivers' },
  { name: 'Equipes', href: '/teams' },
]

// ==================== COMPONENTE ====================

/**
 * Componente de cabeçalho da aplicação
 * 
 * @description Header responsivo que inclui:
 * - Logo clicável (redireciona para home)
 * - Links de navegação (desktop)
 * - Menu hambúrguer (mobile)
 * - Componente de autenticação (login/perfil)
 * 
 * O header é sticky (fixo no topo) e possui z-index alto
 * para permanecer acima de outros elementos.
 * 
 * @returns {JSX.Element} Header responsivo
 * 
 * @example
 * // No layout principal
 * <Header />
 */
export function Header() {
  /** Estado para controlar abertura do menu mobile */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-f1-black shadow-lg sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Formula Info</span>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-f1-red rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">F1</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Formula Info
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Abrir menu principal</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-f1-red dark:hover:text-f1-red transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <AuthHeader />
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50"></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-f1-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Formula Info</span>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-f1-red rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F1</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Formula Info
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Fechar menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <div onClick={() => setMobileMenuOpen(false)}>
                    <AuthHeader />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
