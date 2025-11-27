/**
 * @fileoverview Setup de Testes - FormulaInfo
 * @description Configuração global executada antes dos testes.
 */

import { vi, afterEach } from 'vitest';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração de Variáveis de Ambiente para Testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Hooks Globais
afterEach(() => {
  vi.clearAllMocks();
});
