import { buildApp } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    const app = await buildApp();

    await app.listen({ port: config.port, host: '0.0.0.0' });

    logger.info(`Server is running on port ${config.port}`);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
