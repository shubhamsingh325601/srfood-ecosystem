import { NOTIFICATION_RETRY } from '@/config/constants';
import { Notification } from '@/models/Notification.model';
import { User } from '@/models/User.model';
import { ADMIN_ROLES, NotificationChannel, type NotificationEvent } from '@/types/domain.types';
import { logger } from '@/utils/logger';

import { sendEmail } from './email.service';
import { sendSms } from './sms.service';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dispatchWithRetry(channel: NotificationChannel, to: string, title: string, body: string): Promise<boolean> {
  for (let attempt = 0; attempt <= NOTIFICATION_RETRY.MAX_ATTEMPTS; attempt += 1) {
    try {
      if (channel === NotificationChannel.SMS) await sendSms(to, `${title}: ${body}`);
      else if (channel === NotificationChannel.EMAIL) await sendEmail(to, title, `<p>${body}</p>`);
      return true;
    } catch (error) {
      logger.warn('Notification dispatch attempt failed', { channel, to, attempt, error: error instanceof Error ? error.message : error });
      if (attempt < NOTIFICATION_RETRY.MAX_ATTEMPTS) await sleep(NOTIFICATION_RETRY.BACKOFF_MS[attempt]);
    }
  }
  return false;
}

/**
 * Fire-and-forget dispatch: creates the Notification record(s) synchronously (so the in-app
 * inbox is consistent immediately) but does not block the caller on SMS/email delivery latency —
 * matches the PRD's "notify within 30s, retry 3x with backoff" target without adding queue infra.
 */
export async function notifyUser(userId: string, event: NotificationEvent, title: string, body: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  const inApp = await Notification.create({
    userId,
    event,
    channel: NotificationChannel.IN_APP,
    title,
    body,
    dispatchStatus: 'SENT',
    sentAt: new Date(),
  });
  void inApp;

  const dispatchChannels: { channel: NotificationChannel; enabled: boolean; to: string }[] = [
    { channel: NotificationChannel.SMS, enabled: user.notificationSettings.smsEnabled, to: user.mobile },
    // Accounts register with mobile only — email is optional, so there's nothing to dispatch to without one.
    ...(user.email
      ? [{ channel: NotificationChannel.EMAIL, enabled: user.notificationSettings.emailEnabled, to: user.email }]
      : []),
  ];

  for (const { channel, enabled, to } of dispatchChannels) {
    if (!enabled) continue;
    const doc = await Notification.create({ userId, event, channel, title, body, dispatchStatus: 'PENDING' });
    void dispatchWithRetry(channel, to, title, body).then(async (success) => {
      await Notification.findByIdAndUpdate(doc._id, {
        dispatchStatus: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : undefined,
        $inc: { attemptCount: 1 },
      });
    });
  }
}

/**
 * Fans an in-app notification out to every admin/super_admin user — used for staff-facing
 * alerts (e.g. new order placed) where SMS/email to every admin would be excessive.
 */
export async function notifyAdmins(event: NotificationEvent, title: string, body: string): Promise<void> {
  const admins = await User.find({ role: { $in: ADMIN_ROLES }, isDeleted: false }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      Notification.create({
        userId: admin._id,
        event,
        channel: NotificationChannel.IN_APP,
        title,
        body,
        dispatchStatus: 'SENT',
        sentAt: new Date(),
      }),
    ),
  );
}
