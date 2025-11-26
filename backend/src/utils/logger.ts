/**
 * @fileoverview Configuração do sistema de logging
 * @description Este módulo configura o Pino como logger da aplicação,
 * com suporte a formatação colorida no desenvolvimento e arquivo de logs.
 * 
 * @module logger
 * @requires pino
 * @requires pino-pretty
 */

import { pino } from 'pino';
import pretty from 'pino-pretty';
import { config } from '../config/config';

/**
 * Instância do logger Pino configurada com formatação pretty
 * @constant
 * @type {pino.Logger}
 * 
 * @example
 * import { logger } from './utils/logger';
 * 
 * logger.info('Servidor iniciado');
 * logger.error({ err: error }, 'Erro ao processar requisição');
 */
export const logger = pino(pretty({
  messageFormat: '{msg}',
  ignore: 'level,pid',
  colorize: true,
}));

// Configura o nível de log baseado na configuração
if (config.logging.level) {
  logger.level = config.logging.level;
}

// Cria diretório de logs se não existir
import { promises as fs } from 'fs';
import path from 'path';

const logsDir = path.dirname(config.logging.file);
fs.mkdir(logsDir, { recursive: true }).catch(() => {
  // Diretório pode já existir, ignora o erro
});
