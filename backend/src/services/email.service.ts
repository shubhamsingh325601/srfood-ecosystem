import axios from 'axios';

import { config } from '@/config/index';
import { logger } from '@/utils/logger';

/** Real SendGrid v3 Mail Send API (https://sendgrid.com/docs/api-reference/) — no mock fallback. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: config.sendgrid.fromEmail },
        subject,
        content: [{ type: 'text/html', value: html }],
      },
      {
        headers: {
          Authorization: `Bearer ${config.sendgrid.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10_000,
      },
    );
  } catch (error) {
    logger.error('SendGrid email dispatch failed', {
      error: error instanceof Error ? error.message : error,
      to,
    });
    throw error;
  }
}
