import { AsyncLocalStorage } from 'async_hooks';

import { config } from '@/config/index';

/**
 * Carries the active app id (from the `X-App-ID` header) for the lifetime of a
 * request so that model lookups resolve against the correct per-app connection.
 */
export const appIdStorage = new AsyncLocalStorage<string>();

export function getCurrentAppId(): string {
  return appIdStorage.getStore() ?? config.app.id;
}

export function withAppId<T>(appId: string, fn: () => T): T {
  return appIdStorage.run(appId, fn);
}

export function getCurrentAppFeatures(): (typeof config.app.features) {
  return config.app.featuresForApp(getCurrentAppId());
}