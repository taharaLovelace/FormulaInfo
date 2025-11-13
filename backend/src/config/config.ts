import dotenv from 'dotenv';
import { z } from 'zod';
import { KeyVaultService } from '../services/keyvault.service';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_PREFIX: z.string().default('/api/v1'),
  OPENF1_API_URL: z.string().default('https://api.openf1.org/v1'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  AZURE_KEY_VAULT_URL: z.string().optional()
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Initialize configuration with Azure Key Vault support
async function initializeConfig() {
  let databaseUrl;
  // Se tiver Azure Key Vault configurado, busca as credenciais de lá
  if (env.AZURE_KEY_VAULT_URL) {
    console.log('🔐 Buscando credenciais do banco no Azure Key Vault...');
    const keyVault = new KeyVaultService(env.AZURE_KEY_VAULT_URL);
    const keyVaultDatabaseUrl = await keyVault.getDatabaseCredentials();
    
    if (keyVaultDatabaseUrl) {
      databaseUrl = keyVaultDatabaseUrl;
      // Definir DATABASE_URL para o Prisma
      process.env.DATABASE_URL = keyVaultDatabaseUrl;
      console.log('✅ Credenciais do banco carregadas do Azure Key Vault');
    } else {
      console.log('⚠️  Falha ao carregar do Key Vault, usando DATABASE_URL do .env');
    }
  }

  // Fallback para DATABASE_URL existente se Key Vault falhar
  if (!databaseUrl && env.DATABASE_URL) {
    databaseUrl = env.DATABASE_URL;
    console.log('📋 Usando DATABASE_URL do arquivo .env como fallback');
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required (either from .env or Azure Key Vault)');
  }

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    database: {
      url: databaseUrl
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
    },
    azure: {
      keyVaultUrl: env.AZURE_KEY_VAULT_URL
    }
  } as const;
}

// Export da função para inicializar
export { initializeConfig };
