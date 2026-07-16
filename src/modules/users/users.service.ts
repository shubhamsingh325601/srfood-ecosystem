import { uploadImageBuffer } from '@/services/cloudinary.service';
import { BadRequestError, NotFoundError } from '@/utils/errors';
import { comparePassword, hashPassword } from '@/utils/hash';
import { buildPaginationMeta } from '@/utils/responseFormatter';

import type {
  ChangeMobileInput,
  ChangePasswordInput,
  ListUsersInput,
  UpdateNotificationSettingsInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from './users.dto';
import { usersRepository } from './users.repository';

export const usersService = {
  async getMe(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await usersRepository.updateProfile(userId, input);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await usersRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError('User not found');

    const matches = await comparePassword(input.currentPassword, user.passwordHash);
    if (!matches) throw new BadRequestError('Current password is incorrect');

    const passwordHash = await hashPassword(input.newPassword);
    await usersRepository.updatePassword(userId, passwordHash);
  },

  async changeMobile(userId: string, input: ChangeMobileInput) {
    const user = await usersRepository.updateMobile(userId, input.newMobile);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    const set: Record<string, unknown> = {};
    if (input.dietaryTags) set['preferences.dietaryTags'] = input.dietaryTags;
    if (input.cuisinePreferences) set['preferences.cuisinePreferences'] = input.cuisinePreferences;
    const user = await usersRepository.updateProfile(userId, set);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async updateNotificationSettings(userId: string, input: UpdateNotificationSettingsInput) {
    const set: Record<string, unknown> = {};
    if (input.smsEnabled !== undefined) set['notificationSettings.smsEnabled'] = input.smsEnabled;
    if (input.emailEnabled !== undefined) set['notificationSettings.emailEnabled'] = input.emailEnabled;
    if (input.promotionalEnabled !== undefined) set['notificationSettings.promotionalEnabled'] = input.promotionalEnabled;
    const user = await usersRepository.updateProfile(userId, set);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async uploadPhoto(userId: string, fileBuffer: Buffer) {
    const url = await uploadImageBuffer(fileBuffer, 'srfood/profile-photos');
    const user = await usersRepository.updateProfile(userId, { profilePhotoUrl: url });
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async deleteAccount(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    await usersRepository.softDelete(userId);
  },

  async listAll(input: ListUsersInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await usersRepository.list(input.search, (page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async setBlocked(id: string, isBlocked: boolean) {
    const user = await usersRepository.setBlocked(id, isBlocked);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async setRole(id: string, role: string) {
    const user = await usersRepository.setRole(id, role);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },
};
