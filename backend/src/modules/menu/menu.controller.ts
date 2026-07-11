import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { menuService } from './menu.service';

function requireUser(req: Request) {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
}

function isAdmin(req: Request): boolean {
  return req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
}

export const menuController = {
  listCategories: asyncHandler(async (req: Request, res: Response) => {
    const categories = await menuService.listCategories(isAdmin(req));
    sendSuccess(res, categories);
  }),

  getFullMenu: asyncHandler(async (req: Request, res: Response) => {
    const menu = await menuService.getFullMenu(isAdmin(req));
    sendSuccess(res, menu);
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await menuService.createCategory(req.body);
    sendSuccess(res, category, { statusCode: 201, message: 'Category created' });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const category = await menuService.updateCategory(req.params.id, req.body);
    sendSuccess(res, category, { message: 'Category updated' });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    await menuService.deleteCategory(req.params.id);
    sendSuccess(res, null, { message: 'Category deleted' });
  }),

  popularItems: asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const items = await menuService.popularItems(limit);
    sendSuccess(res, items);
  }),

  getItem: asyncHandler(async (req: Request, res: Response) => {
    const item = await menuService.getItem(req.params.id);
    sendSuccess(res, item);
  }),

  createItem: asyncHandler(async (req: Request, res: Response) => {
    requireUser(req);
    const item = await menuService.createItem(req.body);
    sendSuccess(res, item, { statusCode: 201, message: 'Menu item created' });
  }),

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const item = await menuService.updateItem(req.params.id, req.body, user.id);
    sendSuccess(res, item, { message: 'Menu item updated' });
  }),

  setAvailability: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const item = await menuService.setAvailability(req.params.id, req.body, user.id);
    sendSuccess(res, item, { message: 'Availability updated' });
  }),

  deleteItem: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    await menuService.deleteItem(req.params.id, user.id);
    sendSuccess(res, null, { message: 'Menu item deleted' });
  }),
};
