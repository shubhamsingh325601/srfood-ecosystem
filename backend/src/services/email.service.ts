import axios from 'axios';

import { config } from '@/config/index';
import { logger } from '@/utils/logger';

async function sendViaSendGrid(to: string, subject: string, html: string): Promise<void> {
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
}

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  await axios.post(
    'https://api.resend.com/emails',
    {
      from: config.resend.fromEmail,
      to,
      subject,
      html,
    },
    {
      headers: {
        Authorization: `Bearer ${config.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    },
  );
}

/** Dispatches email via the provider configured for the current app. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    if (config.app.features.resendEmail) {
      await sendViaResend(to, subject, html);
    } else {
      await sendViaSendGrid(to, subject, html);
    }
  } catch (error) {
    logger.error('Email dispatch failed', {
      provider: config.app.features.resendEmail ? 'resend' : 'sendgrid',
      error: error instanceof Error ? error.message : error,
      to,
    });
    throw error;
  }
}
