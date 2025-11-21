'use client';

import { useEffect } from 'react';
import useAuthStore from '../../stores/auth.store';

export default function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Inicializa a autenticação apenas uma vez
    const timeoutId = setTimeout(() => {
      initialize();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [initialize]);

  return null;
}