import { buildApp } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    const app = await buildApp();
    
    const server = await app.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });

    logger.info(`🚀 Formula Info API is running on port ${config.port}`);
    logger.info(`📚 API Documentation: http://localhost:${config.port}/docs`);
    logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      try {
        await app.close();
        logger.info('HTTP server closed');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
