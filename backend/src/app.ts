import Fastify from 'fastify';
import { config } from './config/config';
import { logger } from './utils/logger';

// Plugins
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';

// Routes
import driversRoutes from './routes/drivers';

export const buildApp = async () => {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  // Zod compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, {
    origin: (origin, cb) => {
      const allowed = [
        config.cors.origin,
        'http://localhost',
      ];
      // permitir chamadas internas (sem origin)
      if (!origin) return cb(null, true);
      if (allowed.some(allowedOrigin => origin === allowedOrigin || origin.startsWith(allowedOrigin))) {
        return cb(null, true);
      }
      return cb(new Error('Origin not allowed'), false);
    },
    credentials: true
  });

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

  await app.register(compress);

  await app.register(rateLimit, {
    max: config.rateLimit.maxRequests,
    timeWindow: config.rateLimit.windowMs
  });

  // Swagger documentation
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

  // Health
  app.get('/health', async () => ({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  }));

  // Register routes com prefixo
  const apiPrefix = config.api.prefix;
  await app.register(driversRoutes, { prefix: `${apiPrefix}/drivers` });

  // 404
  app.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({ error: 'Route not found', message: `Cannot ${request.method} ${request.url}` });
  });

  // Error handler
  app.setErrorHandler(async (error, request, reply) => {
    logger.error({ err: error, url: request.url, method: request.method, ip: request.ip }, 'Error occurred');
    reply.status(error.statusCode || 500).send({ error: true, message: error.message || 'Internal Server Error' });
  });

  return app;
};

export default buildApp;
