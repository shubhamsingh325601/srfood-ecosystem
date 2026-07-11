import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { updateUserRoleSchema } from '@/modules/admin/admin.dto';
import { UserRole } from '@/types/domain.types';

import { usersController } from './users.controller';
import {
  changeMobileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  listUsersSchema,
  updateNotificationSettingsSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  userIdParamSchema,
} from './users.dto';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  },
});

export const usersRoutes = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get own profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.get('/me', requireAuth, usersController.getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     summary: Update own profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.patch('/me', requireAuth, validate({ body: updateProfileSchema }), usersController.updateProfile);

/**
 * @openapi
 * /users/me/password:
 *   patch:
 *     summary: Change password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.patch('/me/password', requireAuth, validate({ body: changePasswordSchema }), usersController.changePassword);

/**
 * @openapi
 * /users/me/mobile/send-otp:
 *   post:
 *     summary: Send OTP to new mobile number
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.post('/me/mobile/send-otp', requireAuth, usersController.requestMobileChangeOtp);

/**
 * @openapi
 * /users/me/mobile:
 *   patch:
 *     summary: Change mobile number (OTP-verified)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.patch('/me/mobile', requireAuth, validate({ body: changeMobileSchema }), usersController.changeMobile);

/**
 * @openapi
 * /users/me/preferences:
 *   patch:
 *     summary: Update dietary/cuisine preferences
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.patch('/me/preferences', requireAuth, validate({ body: updatePreferencesSchema }), usersController.updatePreferences);

/**
 * @openapi
 * /users/me/notification-settings:
 *   patch:
 *     summary: Update notification preferences
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.patch(
  '/me/notification-settings',
  requireAuth,
  validate({ body: updateNotificationSettingsSchema }),
  usersController.updateNotificationSettings,
);

/**
 * @openapi
 * /users/me/photo:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.post('/me/photo', requireAuth, upload.single('photo'), usersController.uploadPhoto);

/**
 * @openapi
 * /users/me/request-deletion-otp:
 *   post:
 *     summary: Send OTP required to confirm account deletion
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.post('/me/request-deletion-otp', requireAuth, usersController.requestDeletionOtp);

/**
 * @openapi
 * /users/me:
 *   delete:
 *     summary: Delete own account (OTP-verified, DPDPA)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
usersRoutes.delete('/me', requireAuth, validate({ body: deleteAccountSchema }), usersController.deleteAccount);

export const adminUsersRoutes = Router();

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List users (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
adminUsersRoutes.get('/', requireAuth, requireRole(...adminRoles), validate({ query: listUsersSchema }), usersController.listAll);

/**
 * @openapi
 * /admin/users/{id}/block:
 *   patch:
 *     summary: Block/unblock a user (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
adminUsersRoutes.patch(
  '/:id/block',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: userIdParamSchema }),
  usersController.setBlocked,
);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Assign a role to a user (super admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 */
adminUsersRoutes.patch(
  '/:id/role',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate({ params: userIdParamSchema, body: updateUserRoleSchema }),
  usersController.setRole,
);
