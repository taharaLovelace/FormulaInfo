/**
 * @fileoverview Configuração do Vitest
 * @description Configuração do framework de testes Vitest para o backend do FormulaInfo.
 * Define paths, aliases, cobertura de código e configurações de ambiente.
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Ambiente de execução dos testes
    environment: 'node',
    
    // Diretório raiz dos testes
    root: './src',
    
    // Padrões de arquivos de teste
    include: ['**/__tests__/**/*.test.ts'],
    
    // Arquivos a serem ignorados
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    // Arquivo de setup executado antes de cada arquivo de teste
    setupFiles: ['./__tests__/setup.ts'],
    
    // Configurações de cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../coverage',
      include: ['services/**/*.ts', 'routes/**/*.ts', 'config/**/*.ts'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
    },
    
    // Timeout para cada teste (em ms)
    testTimeout: 10000,
    
    // Timeout para hooks (beforeAll, afterAll, etc.)
    hookTimeout: 10000,
    
    // Execução em modo global (describe, it, expect sem imports)
    globals: true,
  },
  
  // Aliases para imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './src/services'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@config': path.resolve(__dirname, './src/config'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
