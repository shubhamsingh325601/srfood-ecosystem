import dotenv from 'dotenv';

dotenv.config();

import { parseEnv } from '@/config/env.schema';

const env = parseEnv(process.env);

const APP_DB_NAME_MAP: Record<string, string> = {
  shreeradhefood: 'shreeRadhefood',
};

export const config = {
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    apiVersion: env.API_VERSION,
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    id: env.APP_ID,
    allowedIds: env.APP_ALLOWED_IDS ? env.APP_ALLOWED_IDS.split(',').map((s) => s.trim()) : [env.APP_ID],
    name: env.APP_NAME,
    tagline: env.APP_TAGLINE,
    description: env.APP_DESCRIPTION,
    ogTitle: env.APP_OG_TITLE || env.APP_TAGLINE,
    ogDescription: env.APP_OG_DESCRIPTION || env.APP_DESCRIPTION,
    theme: env.APP_THEME,
    secret: env.APP_SECRET,
    features: {
      trains: env.FEATURE_TRAINS,
      stations: env.FEATURE_STATIONS,
      upiPayments: env.FEATURE_UPI_PAYMENTS,
      adminPricing: env.FEATURE_ADMIN_PRICING,
      floatingCartBar: env.FEATURE_FLOATING_CART_BAR,
      resendEmail: env.FEATURE_RESEND_EMAIL,
      sendgridEmail: env.FEATURE_SENDGRID_EMAIL,
      twilioSms: env.FEATURE_TWILIO_SMS,
      msg91Sms: env.FEATURE_MSG91_SMS,
    } as const,
  },
  mongo: {
    uri: env.MONGO_URI,
    dbName: env.MONGO_DB_NAME || env.APP_ID.replace(/-/g, '_') + '_db',
    /** Maps an app id to its MongoDB database name (DB names may differ from the lowercase app id). */
    dbNameForApp: (appId: string): string => {
      if (appId === config.app.id && env.MONGO_DB_NAME) return env.MONGO_DB_NAME;
      return APP_DB_NAME_MAP[appId] ?? appId;
    },
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  msg91: {
    authKey: env.MSG91_AUTH_KEY,
    senderId: env.MSG91_SENDER_ID,
  },
  sendgrid: {
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.SENDGRID_FROM_EMAIL,
  },
  resend: {
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.RESEND_FROM_EMAIL,
  },
  railApi: {
    baseUrl: env.RAIL_API_BASE_URL,
    apiKey: env.RAIL_API_KEY,
  },
  admin: {
    email: env.ADMIN_EMAIL,
    panelUrl: env.ADMIN_PANEL_URL,
  },
  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxPublic: env.RATE_LIMIT_MAX_PUBLIC,
    maxAuthenticated: env.RATE_LIMIT_MAX_AUTHENTICATED,
  },
  security: {
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  swagger: {
    enabled: env.SWAGGER_ENABLED,
  },
} as const;
