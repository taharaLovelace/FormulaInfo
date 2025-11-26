/**
 * @fileoverview Ponto de entrada do servidor
 * @description Inicializa e inicia o servidor Fastify na porta configurada.
 * 
 * @module server
 */

import { buildApp } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

/**
 * Inicia o servidor Fastify
 * 
 * @description Constrói a aplicação e inicia o servidor HTTP
 * na porta definida nas configurações. Em caso de erro,
 * registra o erro e encerra o processo.
 * 
 * @async
 */
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

// Inicia o servidor
startServer();