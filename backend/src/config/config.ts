import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_PREFIX: z.string().default('/api/v1'),
  OPENF1_API_URL: z.string().default('https://api.openf1.org/v1'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE: z.string().default('logs/app.log')
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  database: {
    url: env.DATABASE_URL
  },
  redis: {
    url: env.REDIS_URL
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN
  },
  api: {
    prefix: env.API_PREFIX
  },
  externalApis: {
    openF1: env.OPENF1_API_URL
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS
  },
  cors: {
    origin: env.CORS_ORIGIN
  },
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE
  }
} as const;
