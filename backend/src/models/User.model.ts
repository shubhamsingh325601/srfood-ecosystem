import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { UserRole } from '@/types/domain.types';

export interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  promotionalEnabled: boolean;
}

export interface UserPreferences {
  dietaryTags: string[];
  cuisinePreferences: string[];
}

export interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  profilePhotoUrl?: string;
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  lastLoginAt?: Date;
  failedLoginCount: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.PASSENGER, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    profilePhotoUrl: { type: String },
    preferences: {
      dietaryTags: { type: [String], default: [] },
      cuisinePreferences: { type: [String], default: [] },
    },
    notificationSettings: {
      smsEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      promotionalEnabled: { type: Boolean, default: true },
    },
    lastLoginAt: { type: Date },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export const User = model<UserDocument>('User', userSchema);
