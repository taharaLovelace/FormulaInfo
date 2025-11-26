/**
 * @fileoverview Configuração principal da aplicação Fastify
 * @description Inicializa e configura o servidor Fastify com todos os
 * plugins, middlewares e rotas necessários.
 * 
 * @module app
 */

import Fastify from 'fastify';
import { config } from './config/config';
import { logger } from './utils/logger';

// ==================== PLUGINS ====================
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';

// ==================== ROTAS ====================
import driversRoutes from './routes/drivers';
import authRoutes from './routes/auth';
import teamsRoutes from './routes/teams';

// ==================== BUILDER ====================

/**
 * Constrói e configura a aplicação Fastify
 * 
 * @description Inicializa o servidor com:
 * - Validação Zod para schemas
 * - CORS configurado para credenciais
 * - Helmet para segurança de headers
 * - Compressão de respostas
 * - Cookies e JWT
 * - Rate limiting
 * - Documentação Swagger
 * - Rotas de API (drivers, auth, teams)
 * - Health check endpoint
 * - Handlers de erro 404 e erros gerais
 * 
 * @returns {Promise<FastifyInstance>} Instância configurada do Fastify
 * 
 * @example
 * const app = await buildApp();
 * await app.listen({ port: 3000 });
 */
export const buildApp = async () => {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  // Configura compiladores Zod para validação e serialização
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // ========== CORS ==========
  await app.register(cors, {
    origin: (origin, cb) => {
      const allowed = [
        config.cors.origin,
        'http://localhost',
      ];
      // Permite chamadas internas (sem origin)
      if (!origin) return cb(null, true);
      if (allowed.some(allowedOrigin => origin === allowedOrigin || origin.startsWith(allowedOrigin))) {
        return cb(null, true);
      }
      return cb(new Error('Origin not allowed'), false);
    },
    credentials: true
  });

  // ========== SEGURANÇA ==========
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // ========== COMPRESSÃO ==========
  await app.register(compress);
  
  // ========== COOKIES E JWT ==========
  await app.register(cookie);
  await app.register(jwt, {
    secret: config.jwt.secret
  });

  // ========== RATE LIMITING ==========
  await app.register(rateLimit, {
    max: config.rateLimit.maxRequests,
    timeWindow: config.rateLimit.windowMs
  });

  // ========== SWAGGER (DOCUMENTAÇÃO) ==========
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Formula Info API',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Digite "Bearer <seu-token>" no campo de autorização.'
          }
        }
      },
      security: [{ bearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // ========== HEALTH CHECK ==========
  app.get('/health', async () => ({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  }));

  // ========== REGISTRO DE ROTAS ==========
  const apiPrefix = config.api.prefix;
  await app.register(driversRoutes, { prefix: `${apiPrefix}/drivers` });
  await app.register(authRoutes, { prefix: `${apiPrefix}/auth` });
  await app.register(teamsRoutes, { prefix: apiPrefix });

  // ========== HANDLER 404 ==========
  app.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({ error: 'Route not found', message: `Cannot ${request.method} ${request.url}` });
  });

  // ========== HANDLER DE ERROS ==========
  app.setErrorHandler(async (error, request, reply) => {
    logger.error({ err: error, url: request.url, method: request.method, ip: request.ip }, 'Error occurred');
    reply.status(error.statusCode || 500).send({ error: true, message: error.message || 'Internal Server Error' });
  });

  return app;
};

export default buildApp;