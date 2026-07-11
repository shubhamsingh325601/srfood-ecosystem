import { getServers, setServers } from 'dns';

import mongoose from 'mongoose';

import { config } from '@/config/index';
import { logger } from '@/utils/logger';

mongoose.set('strictQuery', true);

/**
 * Some local networks/VPNs point Node's default DNS resolver at a proxy that can't
 * answer the SRV/TXT lookups a `mongodb+srv://` URI needs, even though the OS resolver
 * and public DNS work fine. Prepending public resolvers (existing ones stay as fallback)
 * fixes that without touching system-wide DNS settings.
 */
function ensureSrvResolvable(): void {
  if (!config.mongo.uri.startsWith('mongodb+srv://')) return;
  const current = getServers();
  const fallbacks = ['8.8.8.8', '1.1.1.1'].filter((ip) => !current.includes(ip));
  if (fallbacks.length) setServers([...fallbacks, ...current]);
}

export async function connectDatabase(): Promise<typeof mongoose> {
  ensureSrvResolvable();
  mongoose.connection.on('error', (error: unknown) => {
    logger.error('MongoDB connection error', { error: error instanceof Error ? error.message : error });
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  const connection = await mongoose.connect(config.mongo.uri);
  logger.info('MongoDB connected', { host: connection.connection.host, db: connection.connection.name });
  return connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
