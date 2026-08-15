import { getServers, setServers } from 'dns';

import mongoose, { type Connection, type Model } from 'mongoose';

import { getCurrentAppId } from '@/config/dbContext';
import { config } from '@/config/index';
import { registerModels } from '@/models/registry';
import { logger } from '@/utils/logger';

mongoose.set('strictQuery', true);

const connections = new Map<string, Connection>();

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

/** Returns a per-app mongoose connection, creating it (and registering models) on first use. */
export function getConnection(appId: string): Connection {
  let conn = connections.get(appId);
  if (!conn) {
    conn = mongoose.createConnection(buildMongoUri(config.mongo.uri, appId));
    conn.on('error', (error: unknown) => {
      logger.error('MongoDB connection error', { app: appId, error: error instanceof Error ? error.message : error });
    });
    conn.on('disconnected', () => {
      logger.warn('MongoDB disconnected', { app: appId });
    });
    registerModels(conn);
    connections.set(appId, conn);
  }
  return conn;
}

/**
 * Resolves a model bound to the connection of the currently-active app id
 * (set per-request via `X-App-ID` in `appValidation`). Falls back to the
 * primary app id when no request context is present (e.g. seed scripts).
 */
export function getModel<T>(name: string): Model<T> {
  return getConnection(getCurrentAppId()).model<T>(name);
}

/** Connects every allowed app up front so no first-request connection delay occurs. */
export async function connectDatabase(): Promise<void> {
  ensureSrvResolvable();
  for (const appId of config.app.allowedIds) {
    const conn = getConnection(appId);
    await conn.asPromise();
    logger.info('MongoDB connected', { app: appId, host: conn.host, db: conn.name });
  }
}

export async function disconnectDatabase(): Promise<void> {
  await Promise.all([...connections.values()].map((conn) => conn.close()));
  connections.clear();
  logger.info('MongoDB disconnected gracefully');
}