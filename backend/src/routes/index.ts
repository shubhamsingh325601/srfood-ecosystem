import { Router } from 'express';

import { adminRoutes } from '@/modules/admin/admin.routes';
import { analyticsRoutes } from '@/modules/analytics/analytics.routes';
import { authRoutes } from '@/modules/auth/auth.routes';
import { cartRoutes } from '@/modules/cart/cart.routes';
import { adminCmsRoutes, cmsRoutes } from '@/modules/cms/cms.routes';
import { adminCouponsRoutes, couponsRoutes } from '@/modules/coupons/coupons.routes';
import { invoicesRoutes } from '@/modules/invoices/invoices.routes';
import { menuRoutes } from '@/modules/menu/menu.routes';
import { notificationsRoutes } from '@/modules/notifications/notifications.routes';
import { adminOrdersRoutes, ordersRoutes } from '@/modules/orders/orders.routes';
import { paymentsRoutes } from '@/modules/payments/payments.routes';
import { adminRatingsRoutes, ratingsRoutes } from '@/modules/ratings/ratings.routes';
import { reportsRoutes } from '@/modules/reports/reports.routes';
import { adminStationsRoutes, stationsRoutes } from '@/modules/stations/stations.routes';
import { adminSupportRoutes, supportRoutes } from '@/modules/support/support.routes';
import { trainsRoutes } from '@/modules/trains/trains.routes';
import { adminUsersRoutes, usersRoutes } from '@/modules/users/users.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/menu', menuRoutes);
apiRouter.use('/stations', stationsRoutes);
apiRouter.use('/trains', trainsRoutes);
apiRouter.use('/coupons', couponsRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/payments', paymentsRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/ratings', ratingsRoutes);
apiRouter.use('/invoices', invoicesRoutes);
apiRouter.use('/support', supportRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/cms', cmsRoutes);

apiRouter.use('/admin/coupons', adminCouponsRoutes);
apiRouter.use('/admin/orders', adminOrdersRoutes);
apiRouter.use('/admin/users', adminUsersRoutes);
apiRouter.use('/admin/support', adminSupportRoutes);
apiRouter.use('/admin/cms', adminCmsRoutes);
apiRouter.use('/admin/analytics', analyticsRoutes);
apiRouter.use('/admin/reports', reportsRoutes);
apiRouter.use('/admin/ratings', adminRatingsRoutes);
apiRouter.use('/admin/stations', adminStationsRoutes);
apiRouter.use('/admin', adminRoutes);
