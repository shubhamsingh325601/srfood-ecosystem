import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().default('v1'),

  APP_ID: z.string().min(1, 'APP_ID is required').regex(/^[a-z0-9-]+$/, 'APP_ID must be lowercase alphanumeric with hyphens only'),
  APP_ALLOWED_IDS: z.string().optional().default(''),
  APP_SECRET: z.string().min(32, 'APP_SECRET must be at least 32 characters'),
  APP_NAME: z.string().min(1, 'APP_NAME is required'),
  APP_TAGLINE: z.string().min(1, 'APP_TAGLINE is required'),
  APP_DESCRIPTION: z.string().min(1, 'APP_DESCRIPTION is required'),
  APP_OG_TITLE: z.string().optional().default(''),
  APP_OG_DESCRIPTION: z.string().optional().default(''),
  APP_THEME: z.enum(['orange', 'red']).default('orange'),

  FEATURE_TRAINS: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_STATIONS: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_UPI_PAYMENTS: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_ADMIN_PRICING: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_FLOATING_CART_BAR: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_RESEND_EMAIL: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_SENDGRID_EMAIL: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_TWILIO_SMS: z.string().default('false').transform((v) => v === 'true'),
  FEATURE_MSG91_SMS: z.string().default('false').transform((v) => v === 'true'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  MONGO_DB_NAME: z.string().optional().default(''),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  MSG91_AUTH_KEY: z.string().optional().default(''),
  MSG91_SENDER_ID: z.string().optional().default(''),

  SENDGRID_API_KEY: z.string().optional().default(''),
  SENDGRID_FROM_EMAIL: z.string().optional().default('no-reply@srfood.example'),

  RESEND_API_KEY: z.string().optional().default(''),
  RESEND_FROM_EMAIL: z.string().optional().default('no-reply@shreeradhefood.in'),

  RAIL_API_BASE_URL: z.string().optional().default(''),
  RAIL_API_KEY: z.string().optional().default(''),

  ADMIN_EMAIL: z.string().optional().default(''),
  ADMIN_PANEL_URL: z.string().optional().default(''),

  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_PUBLIC: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_MAX_AUTHENTICATED: z.coerce.number().int().positive().default(300),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(12).default(12),

  SWAGGER_ENABLED: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
