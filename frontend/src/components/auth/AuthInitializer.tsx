/**
 * @fileoverview Componente inicializador de autenticação
 * @description Componente invisível que inicializa o estado de autenticação
 * no carregamento da aplicação.
 * 
 * @module components/auth/AuthInitializer
 */

'use client';

import { useEffect } from 'react';
import useAuthStore from '../../stores/auth.store';

// ==================== COMPONENTE ====================

/**
 * Inicializador de autenticação
 * 
 * @description Componente renderless que inicializa o estado de autenticação
 * uma única vez no carregamento da aplicação. Deve ser colocado no layout
 * raiz para garantir que a autenticação seja verificada em todas as páginas.
 * 
 * Utiliza um pequeno delay (100ms) para evitar problemas de hidratação
 * em aplicações Next.js.
 * 
 * @returns {null} Não renderiza nada visualmente
 * 
 * @example
 * // No layout.tsx principal
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthInitializer />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */
export default function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Inicializa a autenticação com pequeno delay para evitar problemas de hidratação
    const timeoutId = setTimeout(() => {
      initialize();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [initialize]);

  return null;
}