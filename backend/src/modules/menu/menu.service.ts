import { NotFoundError } from '@/utils/errors';

import type {
  CreateCategoryInput,
  CreateMenuItemInput,
  SetAvailabilityInput,
  UpdateCategoryInput,
  UpdateMenuItemInput,
} from './menu.dto';
import { menuRepository } from './menu.repository';

export const menuService = {
  async listCategories(includeInactive: boolean) {
    return menuRepository.listCategories(includeInactive);
  },

  async getFullMenu(includeUnavailable: boolean) {
    const [categories, items] = await Promise.all([
      menuRepository.listCategories(includeUnavailable),
      menuRepository.listItems(includeUnavailable),
    ]);
    return { categories, items };
  },

  async createCategory(input: CreateCategoryInput) {
    return menuRepository.createCategory(input);
  },

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await menuRepository.updateCategory(id, input);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  },

  async deleteCategory(id: string) {
    const category = await menuRepository.softDeleteCategory(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  },

  async popularItems(limit = 10) {
    return menuRepository.popularItems(limit);
  },

  async getItem(id: string) {
    const item = await menuRepository.findPublicItemById(id);
    if (!item) throw new NotFoundError('Menu item not found');
    return item;
  },

  async createItem(input: CreateMenuItemInput) {
    return menuRepository.createItem(input);
  },

  async updateItem(id: string, input: UpdateMenuItemInput, updatedBy: string) {
    const item = await menuRepository.updateItem(id, input, updatedBy);
    if (!item) throw new NotFoundError('Menu item not found');
    return item;
  },

  async setAvailability(id: string, input: SetAvailabilityInput, updatedBy: string) {
    const item = await menuRepository.updateItem(id, { isAvailable: input.isAvailable }, updatedBy);
    if (!item) throw new NotFoundError('Menu item not found');
    return item;
  },

  async deleteItem(id: string, updatedBy: string) {
    const item = await menuRepository.softDeleteItem(id, updatedBy);
    if (!item) throw new NotFoundError('Menu item not found');
    return item;
  },
};
