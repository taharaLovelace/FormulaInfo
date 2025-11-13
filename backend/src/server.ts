import { buildApp } from './app';
import { initializeConfig } from './config/config';
import { initializePrisma } from './services/database.service';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Inicializar configuração (com Azure Key Vault se configurado)
    const config = await initializeConfig();
    
    initializePrisma();
    
    const app = await buildApp(config);

    await app.listen({ port: config.port, host: '0.0.0.0' });

    logger.info(`Server is running on port ${config.port}`);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
