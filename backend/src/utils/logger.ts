import winston from 'winston';

import { config } from '@/config/index';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${metaStr}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: config.app.isProduction ? 'info' : 'debug',
  format: config.app.isProduction ? prodFormat : devFormat,
  defaultMeta: { service: 'srfood-api' },
  transports: [new winston.transports.Console()],
  silent: config.app.isTest,
});
