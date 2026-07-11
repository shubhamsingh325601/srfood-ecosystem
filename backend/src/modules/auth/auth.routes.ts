import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate.middleware';

import { authController } from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './auth.dto';

export const authRoutes = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new passenger account and dispatch a mobile verification OTP
 *     tags: [Auth]
 */
authRoutes.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     summary: Send (or resend) an OTP for a given purpose
 *     tags: [Auth]
 */
authRoutes.post('/send-otp', authRateLimiter, validate({ body: sendOtpSchema }), authController.sendOtp);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     summary: Verify an OTP; issues tokens when purpose is REGISTER
 *     tags: [Auth]
 */
authRoutes.post('/verify-otp', authRateLimiter, validate({ body: verifyOtpSchema }), authController.verifyOtp);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email/mobile + password
 *     tags: [Auth]
 */
authRoutes.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate a refresh token for a new access/refresh pair
 *     tags: [Auth]
 */
authRoutes.post('/refresh', validate({ body: refreshSchema }), authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 */
authRoutes.post('/logout', requireAuth, validate({ body: logoutSchema }), authController.logout);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password-reset OTP
 *     tags: [Auth]
 */
authRoutes.post('/forgot-password', authRateLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a verified OTP
 *     tags: [Auth]
 */
authRoutes.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
