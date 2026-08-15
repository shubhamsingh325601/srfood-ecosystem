import type { FilterQuery } from 'mongoose';

import { getModel } from '@/config/database';
import type { UserDocument } from '@/models/User.model';

export const usersRepository = {
  async findById(id: string) {
    const User = getModel<UserDocument>('User');
    return User.findOne({ _id: id, isDeleted: false });
  },

  async findByIdWithPassword(id: string) {
    const User = getModel<UserDocument>('User');
    return User.findOne({ _id: id, isDeleted: false }).select('+passwordHash');
  },

  async updateProfile(id: string, data: Record<string, unknown>) {
    const User = getModel<UserDocument>('User');
    return User.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },

  async updatePassword(id: string, passwordHash: string) {
    const User = getModel<UserDocument>('User');
    await User.findByIdAndUpdate(id, { passwordHash });
  },

  async updateMobile(id: string, mobile: string) {
    const User = getModel<UserDocument>('User');
    return User.findByIdAndUpdate(id, { mobile }, { new: true });
  },

  async softDelete(id: string) {
    const User = getModel<UserDocument>('User');
    await User.findByIdAndUpdate(id, { isDeleted: true });
  },

  async list(search: string | undefined, skip: number, limit: number) {
    const User = getModel<UserDocument>('User');
    const query: FilterQuery<UserDocument> = { isDeleted: false };
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { mobile: { $regex: search } }];
    }
    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return { items, total };
  },

  async setBlocked(id: string, isBlocked: boolean) {
    const User = getModel<UserDocument>('User');
    return User.findByIdAndUpdate(id, { isBlocked }, { new: true });
  },

  async setRole(id: string, role: string) {
    const User = getModel<UserDocument>('User');
    return User.findByIdAndUpdate(id, { role }, { new: true });
  },
};