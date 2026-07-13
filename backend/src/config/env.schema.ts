import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().default('v1'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  UPI_VPA: z.string().optional().default(''),
  UPI_PAYEE_NAME: z.string().optional().default('SR Food'),

  MSG91_AUTH_KEY: z.string().optional().default(''),
  MSG91_SENDER_ID: z.string().optional().default(''),

  SENDGRID_API_KEY: z.string().optional().default(''),
  SENDGRID_FROM_EMAIL: z.string().optional().default('no-reply@srfood.example'),

  RAIL_API_BASE_URL: z.string().optional().default(''),
  RAIL_API_KEY: z.string().optional().default(''),

  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_PUBLIC: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_MAX_AUTHENTICATED: z.coerce.number().int().positive().default(300),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(12).default(12),

  SWAGGER_ENABLED: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),

  /** Dev-only: when set, every OTP is this fixed code and is never actually dispatched via SMS/email. Forced off in production regardless of this value — see config/index.ts. */
  OTP_BYPASS_CODE: z
    .string()
    .regex(/^\d{6}$/, 'OTP_BYPASS_CODE must be exactly 6 digits')
    .optional(),
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
