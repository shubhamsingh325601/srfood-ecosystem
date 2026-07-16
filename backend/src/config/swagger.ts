import swaggerJsdoc from 'swagger-jsdoc';

import { config } from '@/config/index';
import { responses, schemas } from '@/config/swagger.schemas';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SR Food API',
      version: '1.0.0',
      description:
        'Railway food ordering platform API (ShreeRadheFood). All responses use the ' +
        '`{ success, data }` / `{ success, error }` envelope shown in the schemas below. ' +
        'Click **Authorize** and paste an access token (from `POST /auth/login`) to try ' +
        'authenticated endpoints — monetary fields are integer paise (₹ = value / 100).',
    },
    servers: [{ url: `/api/${config.app.apiVersion}`, description: 'Current host, versioned API root' }],
    tags: [
      { name: 'Auth', description: 'Registration, OTP, login, token refresh' },
      { name: 'Users', description: "Own profile + admin user management" },
      { name: 'Menu', description: 'Categories and menu items' },
      { name: 'Cart', description: 'Server-side cart price/availability validation' },
      { name: 'Coupons', description: 'Discount coupons' },
      { name: 'Orders', description: 'Order placement, tracking, admin management' },
      { name: 'Payments', description: 'UPI direct-link payment (no gateway) — see ADR 0003' },
      { name: 'Ratings', description: 'Post-delivery ratings & reviews' },
      { name: 'Support', description: 'Support tickets' },
      { name: 'Trains', description: 'Train search, PNR status, stop schedule (vendor-backed)' },
      { name: 'Stations', description: 'Delivery stations' },
      { name: 'Invoices', description: 'Order invoice PDFs' },
      { name: 'Notifications', description: "Own in-app notifications" },
      { name: 'CMS', description: 'Homepage/FAQ/legal/settings content' },
      { name: 'Admin', description: 'Dashboard, audit logs, roles' },
      { name: 'Analytics', description: 'Admin analytics (funnel, revenue, stations, payments)' },
      { name: 'Reports', description: 'Admin operational reports' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas,
      responses,
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
});
