import { pino } from 'pino';
import pretty from 'pino-pretty';
import { config } from '../config/config';

// Create a logger instance
export const logger = pino(pretty({
  messageFormat: '{msg}',
  ignore: 'level,pid',
  colorize: true,
}));

// Override the default level if specified in the config
if (config.logging.level) {
  logger.level = config.logging.level;
}

// Create logs directory if it doesn't exist
import { promises as fs } from 'fs';
import path from 'path';

const logsDir = path.dirname(config.logging.file);
fs.mkdir(logsDir, { recursive: true }).catch(() => {
  // Directory might already exist, ignore error
});
