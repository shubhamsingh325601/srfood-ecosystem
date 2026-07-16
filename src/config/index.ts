import dotenv from 'dotenv';

dotenv.config();

import { parseEnv } from '@/config/env.schema';

const env = parseEnv(process.env);

export const config = {
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    apiVersion: env.API_VERSION,
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  mongo: {
    uri: env.MONGO_URI,
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
  railApi: {
    baseUrl: env.RAIL_API_BASE_URL,
    apiKey: env.RAIL_API_KEY,
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
