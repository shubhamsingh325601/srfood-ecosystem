import type { FilterQuery } from 'mongoose';

import { User, type UserDocument } from '@/models/User.model';

export const usersRepository = {
  async findById(id: string) {
    return User.findOne({ _id: id, isDeleted: false });
  },

  async findByIdWithPassword(id: string) {
    return User.findOne({ _id: id, isDeleted: false }).select('+passwordHash');
  },

  async updateProfile(id: string, data: Record<string, unknown>) {
    return User.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },

  async updatePassword(id: string, passwordHash: string) {
    await User.findByIdAndUpdate(id, { passwordHash });
  },

  async updateMobile(id: string, mobile: string) {
    return User.findByIdAndUpdate(id, { mobile, isMobileVerified: true }, { new: true });
  },

  async softDelete(id: string) {
    await User.findByIdAndUpdate(id, { isDeleted: true });
  },

  async list(search: string | undefined, skip: number, limit: number) {
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
    return User.findByIdAndUpdate(id, { isBlocked }, { new: true });
  },

  async setRole(id: string, role: string) {
    return User.findByIdAndUpdate(id, { role }, { new: true });
  },
};
