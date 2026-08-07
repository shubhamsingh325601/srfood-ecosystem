import axios from 'axios';

import { config } from '@/config/index';
import type { OrderDocument } from '@/models/Order.model';
import { logger } from '@/utils/logger';

/** Real Resend API (https://resend.com/docs/api-reference/emails/send-email) — no mock fallback. */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await axios.post(
      'https://api.resend.com/emails',
      {
        from: config.resend.fromEmail,
        to: [to],
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
  } catch (error) {
    logger.error('Resend email dispatch failed', {
      error: error instanceof Error ? error.message : error,
      to,
    });
    throw error;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildAdminOrderAlertHtml(order: OrderDocument, adminPanelUrl: string): string {
  const address = order.deliveryAddress;
  const addressLine = [
    address.line,
    address.landmark,
    address.city,
    address.state,
  ]
    .filter(Boolean)
    .map((part) => escapeHtml(part as string))
    .join(', ');

  const itemsHtml = order.items
    .map((item) => {
      const customizations = item.customizations.length
        ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">${item.customizations.map((c) => escapeHtml(c.optionLabel)).join(', ')}</div>`
        : '';
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#111827;">
          ${escapeHtml(item.name)}${customizations}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:14px;color:#111827;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;color:#111827;white-space:nowrap;">${formatRupees(item.itemTotal)}</td>
      </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background-color:#dc2626;padding:20px 24px;">
              <div style="color:#ffffff;font-size:20px;font-weight:700;">SR Food — New Order Received</div>
              <div style="color:#fecaca;font-size:13px;margin-top:2px;">Order ${escapeHtml(order.orderId)} · ${formatRupees(order.grandTotal)} · ${order.paymentMethod}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:15px;color:#111827;line-height:1.5;">
                A new order has been placed on the SR Food platform. Review it now:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                <tr>
                  <td align="center" style="padding:0;">
                    <a href="${escapeHtml(adminPanelUrl)}" style="display:inline-block;background-color:#dc2626;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">View Order in Admin Panel</a>
                  </td>
                </tr>
              </table>
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:#f9fafb;padding:8px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Order Summary</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Order ID</td>
                          <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-family:monospace;">${escapeHtml(order.orderId)}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Placed At</td>
                          <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;">${new Date(order.createdAt).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Customer</td>
                          <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;">${escapeHtml(order.customerName)} (${escapeHtml(order.customerMobile)})</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Delivery Address</td>
                          <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;">${addressLine}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Payment Method</td>
                          <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;">${order.paymentMethod}${order.utrReference ? ` · ${escapeHtml(order.utrReference)}` : ''}</td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Payment Status</td>
                          <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;">${escapeHtml(order.paymentStatus)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:#f9fafb;padding:8px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Items</td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <th style="padding:8px 12px;font-size:12px;text-align:left;color:#6b7280;">Item</th>
                    <th style="padding:8px 12px;font-size:12px;text-align:center;color:#6b7280;">Qty</th>
                    <th style="padding:8px 12px;font-size:12px;text-align:right;color:#6b7280;">Amount</th>
                  </tr>
                  ${itemsHtml}
                </table>
              </div>
              <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 12px;font-size:13px;color:#6b7280;">Subtotal</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;white-space:nowrap;">${formatRupees(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;font-size:13px;color:#6b7280;">Delivery Fee</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;white-space:nowrap;">${formatRupees(order.deliveryFeePaise)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;font-size:13px;color:#6b7280;">Platform Fee</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;white-space:nowrap;">${formatRupees(order.platformFeePaise)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;font-size:13px;color:#6b7280;">GST</td>
                    <td style="padding:10px 12px;font-size:13px;color:#111827;text-align:right;white-space:nowrap;">${formatRupees(order.gstAmountPaise)}</td>
                  </tr>
                  ${order.couponCode ? `<tr>
                    <td style="padding:10px 12px;font-size:13px;color:#6b7280;">Coupon (${escapeHtml(order.couponCode)})</td>
                    <td style="padding:10px 12px;font-size:13px;color:#16a34a;text-align:right;white-space:nowrap;">− ${formatRupees(order.couponDiscountPaise)}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:12px;font-size:15px;font-weight:700;color:#111827;border-top:1px solid #f1f5f9;">Total</td>
                    <td style="padding:12px;font-size:15px;font-weight:700;color:#dc2626;text-align:right;border-top:1px solid #f1f5f9;white-space:nowrap;">${formatRupees(order.grandTotal)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Sends the order-placed alert to the admin inbox with a deep link to the admin panel. */
export async function sendAdminOrderAlert(order: OrderDocument): Promise<void> {
  await sendEmail(
    config.admin.email,
    `New Order ${order.orderId} — ${formatRupees(order.grandTotal)}`,
    buildAdminOrderAlertHtml(order, config.admin.panelUrl),
  );
}
