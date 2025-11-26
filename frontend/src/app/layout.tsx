/**
 * @fileoverview Layout Principal da Aplicação
 * @description Layout raiz do Next.js que define a estrutura base de todas as páginas,
 * incluindo metadados SEO, fonte, tema e componentes globais (Header e Footer).
 */

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

/** Configuração da fonte Inter do Google Fonts */
const inter = Inter({ subsets: ['latin'] })

/**
 * Metadados globais da aplicação para SEO.
 * 
 * @description Configura título, descrição, keywords, Open Graph,
 * Twitter Cards, robots e verificação do Google.
 */
export const metadata: Metadata = {
  title: 'Formula Info - Portal dos Fãs de F1',
  description: 'Seu portal completo de informações sobre Fórmula 1. Estatísticas, perfis de pilotos, histórico de corridas e muito mais.',
  keywords: 'Formula 1, F1, pilotos, corridas, estatísticas, automobilismo',
  authors: [{ name: 'Formula Info Team' }],
  creator: 'Formula Info Team',
  publisher: 'Formula Info',
  icons: [{ rel: 'icon', url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏎️</text></svg>' }],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  // Configurações Open Graph para compartilhamento em redes sociais
  openGraph: {
    title: 'Formula Info - Portal dos Fãs de F1',
    description: 'Seu portal completo de informações sobre Fórmula 1',
    url: '/',
    siteName: 'Formula Info',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Formula Info',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  // Configurações Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Formula Info - Portal dos Fãs de F1',
    description: 'Seu portal completo de informações sobre Fórmula 1',
    images: ['/images/twitter-image.jpg'],
  },
  // Configurações de indexação para motores de busca
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

/**
 * Layout raiz da aplicação Next.js.
 * 
 * @description Define a estrutura HTML base incluindo:
 * - Tag html com idioma pt-BR e scroll suave
 * - Body com fonte Inter e suporte a dark mode
 * - Providers globais (React Query, Toaster, Auth)
 * - Header e Footer persistentes em todas as páginas
 * 
 * @param {Object} props - Props do componente
 * @param {React.ReactNode} props.children - Conteúdo da página atual
 * @returns {JSX.Element} Estrutura HTML completa da aplicação
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-white dark:bg-f1-black`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
