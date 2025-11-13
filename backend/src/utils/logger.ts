import { pino } from 'pino';
import pretty from 'pino-pretty';

// Create a logger instance with default settings
export const logger = pino(pretty({
  messageFormat: '{msg}',
  ignore: 'level,pid',
  colorize: true,
}));

// Default log level
logger.level = process.env.LOG_LEVEL || 'info';

// Create logs directory if it doesn't exist
import { promises as fs } from 'fs';
import path from 'path';

const logsDir = path.dirname(process.env.LOG_FILE || 'logs/app.log');
fs.mkdir(logsDir, { recursive: true }).catch(() => {
  // Directory might already exist, ignore error
});
