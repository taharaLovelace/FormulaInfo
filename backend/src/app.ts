import Fastify, { FastifyInstance } from 'fastify';
import { config } from './config/config';
import { logger } from './utils/logger';

// Plugins
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// Routes
import authRoutes from './routes/auth';
import driversRoutes from './routes/drivers';
import teamsRoutes from './routes/teams';
import racesRoutes from './routes/races';
import usersRoutes from './routes/users';
import f1DataRoutes from './routes/f1-data';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: config.logging.level,
      transport: config.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      } : undefined
    }
  });

  // Register plugins
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
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
        description: 'API for Formula 1 fan platform with historical data and driver profiles',
        version: '1.0.0',
        contact: {
          name: 'Formula Info Team',
          email: 'dev@formula-info.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${config.port}${config.api.prefix}`,
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });

  // Health check
  app.get('/health', async () => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv
    };
  });

  // Register routes
  const apiPrefix = config.api.prefix;
  await app.register(authRoutes, { prefix: `${apiPrefix}/auth` });
  await app.register(driversRoutes, { prefix: `${apiPrefix}/drivers` });
  await app.register(teamsRoutes, { prefix: `${apiPrefix}/teams` });
  await app.register(racesRoutes, { prefix: `${apiPrefix}/races` });
  await app.register(usersRoutes, { prefix: `${apiPrefix}/users` });
  await app.register(f1DataRoutes, { prefix: `${apiPrefix}/f1-data` });

  // 404 handler
  app.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      error: 'Route not found',
      message: `Cannot ${request.method} ${request.url}`
    });
  });

  // Error handler
  app.setErrorHandler(async (error, request, reply) => {
    logger.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      ip: request.ip
    });

    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'Internal Server Error';

    reply.status(statusCode).send({
      error: true,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(config.nodeEnv === 'development' && { stack: error.stack })
    });
  });

  return app;
};

export default buildApp;
