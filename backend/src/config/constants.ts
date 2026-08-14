import { config } from '@/config/index';

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const PRICING = config.app.features.adminPricing
  ? {
      GST_PERCENT: 0,
      DELIVERY_FEE_PAISE: 0,
      PLATFORM_FEE_PAISE: 0,
      MIN_ORDER_VALUE_PAISE: 0,
      COD_ELIGIBLE: true,
      COD_MAX_AMOUNT_PAISE: 50000,
      RE_AUTH_THRESHOLD_PAISE: 1000000,
    }
  : {
      GST_PERCENT: 5,
      DELIVERY_FEE_PAISE: 2900,
      PLATFORM_FEE_PAISE: 0,
      MIN_ORDER_VALUE_PAISE: 10000,
      COD_ELIGIBLE: true,
      COD_MAX_AMOUNT_PAISE: 50000,
      RE_AUTH_THRESHOLD_PAISE: 1000000,
    };

export const DELIVERY_WINDOW_MINUTES = config.app.features.adminPricing ? 30 : 45;

export const AUTH_LOCKOUT = {
  MAX_FAILED_ATTEMPTS: 5,
  COOLDOWN_MINUTES: 30,
} as const;

export const TRAIN_SCHEDULE_CACHE_TTL_HOURS = config.app.features.trains ? 24 : 0;

export const RATING = {
  POST_DELIVERY_DELAY_MINUTES: 15,
  SUBMISSION_WINDOW_DAYS: 7,
  EDIT_WINDOW_HOURS: 48,
} as const;

export const ORDER_CANCELLATION = {
  FULL_REFUND_WINDOW_MINUTES: 5,
} as const;

export const NOTIFICATION_RETRY = {
  MAX_ATTEMPTS: 3,
  BACKOFF_MS: [5_000, 30_000, 120_000],
} as const;
