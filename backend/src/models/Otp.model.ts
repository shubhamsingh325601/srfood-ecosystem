import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export type OtpPurpose = 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | 'CHANGE_MOBILE' | 'SENSITIVE_ACTION';

export interface OtpDocument {
  _id: Types.ObjectId;
  identifier: string;
  purpose: OtpPurpose;
  codeHash: string;
  attemptCount: number;
  resendCount: number;
  isConsumed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<OtpDocument>(
  {
    identifier: { type: String, required: true, index: true },
    purpose: {
      type: String,
      enum: ['REGISTER', 'LOGIN', 'FORGOT_PASSWORD', 'CHANGE_MOBILE', 'SENSITIVE_ACTION'],
      required: true,
    },
    codeHash: { type: String, required: true },
    attemptCount: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    isConsumed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

otpSchema.index({ identifier: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = model<OtpDocument>('Otp', otpSchema);
