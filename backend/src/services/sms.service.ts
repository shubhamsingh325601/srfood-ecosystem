import axios from 'axios';

import { config } from '@/config/index';
import { logger } from '@/utils/logger';

/** Real MSG91 v2 SMS send API (https://api.msg91.com/api/v2/sendsms) — no mock fallback. */
export async function sendSms(toMobile: string, message: string): Promise<void> {
  try {
    await axios.post(
      'https://api.msg91.com/api/v2/sendsms',
      {
        sender: config.msg91.senderId,
        route: '4',
        country: '91',
        sms: [{ message, to: [toMobile] }],
      },
      {
        headers: {
          authkey: config.msg91.authKey,
          'Content-Type': 'application/json',
        },
        timeout: 10_000,
      },
    );
  } catch (error) {
    logger.error('MSG91 SMS dispatch failed', {
      error: error instanceof Error ? error.message : error,
      toMobile,
    });
    throw error;
  }
}
