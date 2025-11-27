/**
 * @fileoverview Configuração centralizada da aplicação
 * @description Este módulo carrega e valida as variáveis de ambiente,
 * exportando um objeto de configuração tipado para uso em toda a aplicação.
 * 
 * @module config
 * @requires dotenv
 * @requires zod
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Schema de validação das variáveis de ambiente
 * Utiliza Zod para garantir que todas as variáveis obrigatórias
 * estejam presentes e com os tipos corretos
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().default('redis_password'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE: z.string().default('logs/app.log')
});

// Valida as variáveis de ambiente
const env = envSchema.parse(process.env);

/**
 * Objeto de configuração da aplicação
 * @constant
 * @type {Object}
 * 
 * @property {string} nodeEnv - Ambiente de execução (development, production, test)
 * @property {number} port - Porta do servidor HTTP
 * @property {Object} database - Configurações do banco de dados
 * @property {Object} jwt - Configurações de autenticação JWT
 * @property {Object} redis - Configurações do Redis
 * @property {Object} api - Configurações da API
 * @property {Object} rateLimit - Configurações de rate limiting
 * @property {Object} cors - Configurações de CORS
 * @property {Object} logging - Configurações de logging
 */
export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  database: {
    url: env.DATABASE_URL
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD
  },
  api: {
    prefix: env.API_PREFIX
  },
  rateLimit: {
    windowMs: 900000, // 15 minutos
    maxRequests: 100  // 100 requests por janela
  },
  cors: {
    origin: env.CORS_ORIGIN
  },
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE
  }
} as const;
