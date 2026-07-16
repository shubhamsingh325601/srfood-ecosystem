import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { authRateLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate.middleware';

import { authController } from './auth.controller';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.dto';

export const authRoutes = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new passenger account with mobile number + password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, mobile, password]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 80, example: 'Asha Verma' }
 *               mobile: { type: string, pattern: '^[6-9]\d{9}$', example: '9876543210', description: '10-digit Indian mobile number — the only login identifier' }
 *               password: { type: string, minLength: 8, maxLength: 72, example: 'Passw0rd!', description: 'Must contain at least one letter and one number' }
 *     responses:
 *       '201':
 *         description: Registered — tokens issued immediately
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       '409':
 *         description: An account already exists with this mobile number
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 *       '429': { $ref: '#/components/responses/TooManyRequests' }
 */
authRoutes.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with mobile number + password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier: { type: string, example: '9876543210', description: 'Mobile number (field accepts email too, for legacy/admin accounts)' }
 *               password: { type: string, example: 'Passw0rd!' }
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403':
 *         description: Account locked due to repeated failed logins
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 *       '429': { $ref: '#/components/responses/TooManyRequests' }
 */
authRoutes.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate a refresh token for a new access/refresh pair
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       '200':
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TokensResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
authRoutes.post('/refresh', validate({ body: refreshSchema }), authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       '200':
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NullDataResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
authRoutes.post('/logout', requireAuth, validate({ body: logoutSchema }), authController.logout);
