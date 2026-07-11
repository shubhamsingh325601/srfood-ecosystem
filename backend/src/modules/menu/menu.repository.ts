import { Category } from '@/models/Category.model';
import { MenuItem } from '@/models/MenuItem.model';

export const menuRepository = {
  async listCategories(includeInactive: boolean) {
    const query = includeInactive ? { isDeleted: false } : { isDeleted: false, isActive: true };
    return Category.find(query).sort({ displayOrder: 1, name: 1 });
  },

  async findCategoryBySlug(slug: string) {
    return Category.findOne({ slug, isDeleted: false });
  },

  async createCategory(data: Record<string, unknown>) {
    return Category.create(data);
  },

  async updateCategory(id: string, data: Record<string, unknown>) {
    return Category.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },

  async softDeleteCategory(id: string) {
    return Category.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, isActive: false }, { new: true });
  },

  async popularItems(limit: number) {
    return MenuItem.find({ isDeleted: false, isAvailable: true, isBestseller: true })
      .sort({ avgRating: -1, ratingCount: -1 })
      .limit(limit);
  },

  async listItems(includeUnavailable: boolean) {
    const query = includeUnavailable ? { isDeleted: false } : { isDeleted: false, isAvailable: true };
    return MenuItem.find(query).sort({ name: 1 });
  },

  async findItemById(id: string) {
    return MenuItem.findOne({ _id: id, isDeleted: false });
  },

  async findPublicItemById(id: string) {
    return MenuItem.findOne({ _id: id, isDeleted: false });
  },

  async createItem(data: Record<string, unknown>) {
    return MenuItem.create(data);
  },

  async updateItem(id: string, data: Record<string, unknown>, updatedBy: string) {
    return MenuItem.findOneAndUpdate({ _id: id, isDeleted: false }, { ...data, updatedBy }, { new: true });
  },

  async softDeleteItem(id: string, updatedBy: string) {
    return MenuItem.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, updatedBy }, { new: true });
  },
};
