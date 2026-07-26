import type { Request, Response } from 'express';

import { uploadImageBuffer } from '@/services/cloudinary.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { BadRequestError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

const ALLOWED_FOLDERS = ['menu-items', 'categories'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

function resolveFolder(input: unknown): AllowedFolder {
  return ALLOWED_FOLDERS.includes(input as AllowedFolder) ? (input as AllowedFolder) : 'menu-items';
}

export const uploadsController = {
  uploadImage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No image file provided');
    const folder = resolveFolder(req.body?.folder);
    const url = await uploadImageBuffer(req.file.buffer, `srfood/${folder}`);
    sendSuccess(res, { url }, { message: 'Image uploaded' });
  }),
};
