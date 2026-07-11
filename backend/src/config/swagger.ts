import swaggerJsdoc from 'swagger-jsdoc';

import { config } from '@/config/index';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SR Food API',
      version: '1.0.0',
      description: 'Railway food ordering platform API',
    },
    servers: [{ url: `/api/${config.app.apiVersion}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
});
