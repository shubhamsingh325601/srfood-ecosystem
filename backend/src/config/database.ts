import { getServers, setServers } from 'dns';

import mongoose from 'mongoose';

import { config } from '@/config/index';
import { logger } from '@/utils/logger';

mongoose.set('strictQuery', true);

function ensureSrvResolvable(): void {
  if (!config.mongo.uri.startsWith('mongodb+srv://')) return;
  const current = getServers();
  const fallbacks = ['8.8.8.8', '1.1.1.1'].filter((ip) => !current.includes(ip));
  if (fallbacks.length) setServers([...fallbacks, ...current]);
}

function buildMongoUri(baseUri: string, dbName: string): string {
  if (baseUri.includes('/') && baseUri.split('/').length > 3) {
    const lastSegment = baseUri.split('/').pop()?.split('?')[0];
    if (lastSegment && !lastSegment.includes('@')) {
      return baseUri.replace(/\/[^/?]+(\?.*)?$/, `/${dbName}$1`);
    }
  }
  return `${baseUri}/${dbName}`;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  ensureSrvResolvable();
  mongoose.connection.on('error', (error: unknown) => {
    logger.error('MongoDB connection error', { error: error instanceof Error ? error.message : error });
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  const uri = buildMongoUri(config.mongo.uri, config.mongo.dbName);
  const connection = await mongoose.connect(uri);
  logger.info('MongoDB connected', { app: config.app.id, host: connection.connection.host, db: connection.connection.name });
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
