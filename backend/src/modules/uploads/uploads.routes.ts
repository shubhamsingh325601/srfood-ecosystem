import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { UserRole } from '@/types/domain.types';

import { uploadsController } from './uploads.controller';

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype));
  },
});

export const adminUploadsRoutes = Router();

/**
 * @openapi
 * /admin/uploads/image:
 *   post:
 *     summary: Upload an image (menu item / category photo) to Cloudinary (admin)
 *     tags: [Uploads]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, format: binary, description: 'JPEG, PNG, WEBP or GIF, up to 5MB' }
 *               folder: { type: string, enum: [menu-items, categories], description: 'Defaults to menu-items' }
 *     responses:
 *       '200':
 *         description: Uploaded — returns the hosted image URL
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ImageUploadResponse' }
 *       '400': { $ref: '#/components/responses/BadRequest' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 */
adminUploadsRoutes.post(
  '/image',
  requireAuth,
  requireRole(...adminRoles),
  upload.single('image'),
  uploadsController.uploadImage,
);
