import { PRICING } from '@/config/constants';
import type { OrderDocument } from '@/models/Order.model';
import { cartService } from '@/modules/cart/cart.service';
import { couponsService } from '@/modules/coupons/coupons.service';
import { paymentsService } from '@/modules/payments/payments.service';
import { notifyAdmins, notifyUser } from '@/services/notification.service';
import { NotificationEvent, ORDER_STATUS_TRANSITIONS, OrderStatus, PaymentMode, PaymentStatus, UserRole } from '@/types/domain.types';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@/utils/errors';
import { generateOrderId } from '@/utils/orderIdGenerator';
import { buildPaginationMeta } from '@/utils/responseFormatter';

const STATUS_NOTIFICATIONS: Partial<Record<OrderStatus, { event: NotificationEvent; title: string; body: (orderId: string) => string }>> = {
  [OrderStatus.RESTAURANT_ACCEPTED]: {
    event: NotificationEvent.ORDER_ACCEPTED,
    title: 'Order accepted',
    body: (orderId) => `Your order ${orderId} has been accepted and will start preparing shortly.`,
  },
  [OrderStatus.RESTAURANT_REJECTED]: {
    event: NotificationEvent.ORDER_REJECTED,
    title: 'Order rejected',
    body: (orderId) => `Unfortunately your order ${orderId} could not be fulfilled. A refund will be initiated.`,
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    event: NotificationEvent.ORDER_OUT_FOR_DELIVERY,
    title: 'Out for delivery',
    body: (orderId) => `Your order ${orderId} is out for delivery to your seat.`,
  },
  [OrderStatus.DELIVERED]: {
    event: NotificationEvent.ORDER_DELIVERED,
    title: 'Order delivered',
    body: (orderId) => `Your order ${orderId} has been delivered. Bon appetit!`,
  },
};

async function notifyStatusChange(order: OrderDocument, status: OrderStatus): Promise<void> {
  const config = STATUS_NOTIFICATIONS[status];
  if (!config) return;
  await notifyUser(order.passengerId.toString(), config.event, config.title, config.body(order.orderId));
}

import type { CancelOrderInput, CreateOrderInput, ListAdminOrdersInput, ListOrdersInput, UpdateOrderStatusInput } from './orders.dto';
import { ordersRepository } from './orders.repository';

const PASSENGER_CANCELLABLE_STATUSES = [OrderStatus.PENDING_PAYMENT, OrderStatus.ORDER_PLACED, OrderStatus.RESTAURANT_NOTIFIED];

function assertTransitionAllowed(current: OrderStatus, next: OrderStatus): void {
  if (!ORDER_STATUS_TRANSITIONS[current].includes(next)) {
    throw new BadRequestError(`Cannot transition order from ${current} to ${next}`);
  }
}

async function assertOwnership(order: OrderDocument, userId: string): Promise<void> {
  if (order.passengerId.toString() !== userId) throw new ForbiddenError('You do not have access to this order');
}

export const ordersService = {
  async createOrder(userId: string, idempotencyKey: string, input: CreateOrderInput) {
    const existing = await ordersRepository.findByIdempotencyKey(idempotencyKey);
    if (existing) return { order: existing, payment: null, replay: true };

    const validatedCart = await cartService.validateCart(input.cart, userId);

    const isCod = input.paymentMethod === 'COD';
    const paymentMode = isCod ? PaymentMode.COD : PaymentMode.ONLINE;

    if (isCod) {
      if (!PRICING.COD_ELIGIBLE) throw new BadRequestError('Cash on Delivery is not available');
      if (validatedCart.grandTotal > PRICING.COD_MAX_AMOUNT_PAISE) {
        throw new BadRequestError(`Cash on Delivery is only available for orders up to ₹${PRICING.COD_MAX_AMOUNT_PAISE / 100}`);
      }
    }

    const orderId = await generateOrderId();
    const initialStatus = isCod ? OrderStatus.ORDER_PLACED : OrderStatus.PENDING_PAYMENT;

    const order = await ordersRepository.create({
      orderId,
      passengerId: userId,
      trainNumber: input.trainNumber,
      pnr: input.pnr,
      coach: input.coach,
      seat: input.seat,
      boardingStation: input.boardingStation,
      deliveryStation: input.deliveryStation,
      items: validatedCart.items,
      subtotal: validatedCart.subtotal,
      deliveryFeePaise: validatedCart.deliveryFeePaise,
      platformFeePaise: validatedCart.platformFeePaise,
      gstAmountPaise: validatedCart.gstAmountPaise,
      couponCode: validatedCart.couponCode,
      couponDiscountPaise: validatedCart.couponDiscountPaise,
      grandTotal: validatedCart.grandTotal,
      status: initialStatus,
      statusHistory: [{ status: initialStatus, changedAt: new Date() }],
      paymentMode,
      paymentMethod: input.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      idempotencyKey,
    });

    if (validatedCart.couponId) {
      await couponsService.recordUsage(validatedCart.couponId, userId, order._id.toString(), validatedCart.couponDiscountPaise);
    }

    if (isCod) {
      await paymentsService.recordCodPayment(order._id.toString(), validatedCart.grandTotal);
      await notifyUser(userId, NotificationEvent.ORDER_PLACED, 'Order placed', `Your order ${order.orderId} has been placed.`);
      await notifyAdmins(
        NotificationEvent.ORDER_PLACED,
        'New order received',
        `Order ${order.orderId} — ₹${(order.grandTotal / 100).toFixed(2)} (COD)`,
      );
      return { order, payment: null, replay: false };
    }

    const payment = await paymentsService.createForOrder(order._id.toString(), validatedCart.grandTotal, input.paymentMethod);
    return { order, payment, replay: false };
  },

  async listOrders(userId: string, input: ListOrdersInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await ordersRepository.listForUser(userId, input.status, (page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listForAdmin(input: ListAdminOrdersInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await ordersRepository.listForAdmin(
      { status: input.status, passengerId: input.passengerId },
      (page - 1) * limit,
      limit,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getOrder(idOrOrderId: string, user: { id: string; role: UserRole }) {
    const order = await ordersRepository.findByIdOrOrderId(idOrOrderId);
    if (!order) throw new NotFoundError('Order not found');

    const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    if (!isStaff) await assertOwnership(order, user.id);
    return order;
  },

  async assertOwnership(orderId: string, userId: string): Promise<OrderDocument> {
    const order = await ordersRepository.findByIdOrOrderId(orderId);
    if (!order) throw new NotFoundError('Order not found');
    await assertOwnership(order, userId);
    return order;
  },

  async cancelOrder(idOrOrderId: string, userId: string, input: CancelOrderInput) {
    const order = await ordersRepository.findByIdOrOrderId(idOrOrderId);
    if (!order) throw new NotFoundError('Order not found');
    await assertOwnership(order, userId);

    if (!PASSENGER_CANCELLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestError('This order can no longer be cancelled — please contact support for help');
    }
    assertTransitionAllowed(order.status, OrderStatus.CANCELLED_BY_PASSENGER);

    let updated = await ordersRepository.appendStatus(
      order._id.toString(),
      { status: OrderStatus.CANCELLED_BY_PASSENGER, changedAt: new Date(), changedBy: userId, note: input.reason },
      { cancellationReason: input.reason },
    );

    if (order.paymentStatus === PaymentStatus.CAPTURED) {
      await paymentsService.refund(order._id.toString(), order.grandTotal, input.reason);
      updated = await ordersRepository.appendStatus(order._id.toString(), {
        status: OrderStatus.REFUND_INITIATED,
        changedAt: new Date(),
        note: 'Automatic refund on cancellation',
      });
      await notifyUser(userId, NotificationEvent.REFUND_PROCESSED, 'Refund initiated', `A refund for order ${order.orderId} has been initiated.`);
    }

    await notifyUser(userId, NotificationEvent.ORDER_CANCELLED, 'Order cancelled', `Your order ${order.orderId} has been cancelled.`);

    return updated;
  },

  async reorder(idOrOrderId: string, userId: string) {
    const order = await ordersRepository.findByIdOrOrderId(idOrOrderId);
    if (!order) throw new NotFoundError('Order not found');
    await assertOwnership(order, userId);

    return cartService.validateCart(
      {
        items: order.items.map((item) => ({
          menuItemId: item.menuItemId.toString(),
          quantity: item.quantity,
          customizations: item.customizations.map((c) => ({ groupName: c.groupName, optionLabel: c.optionLabel })),
          specialNote: item.specialNote,
        })),
      },
      userId,
    );
  },

  async updateStatus(idOrOrderId: string, actor: { id: string; role: UserRole }, input: UpdateOrderStatusInput) {
    const order = await ordersRepository.findByIdOrOrderId(idOrOrderId);
    if (!order) throw new NotFoundError('Order not found');

    assertTransitionAllowed(order.status, input.status);
    const updated = await ordersRepository.appendStatus(order._id.toString(), {
      status: input.status,
      changedAt: new Date(),
      changedBy: actor.id,
      note: input.note,
    });
    await notifyStatusChange(order, input.status);
    return updated;
  },

  /** Called by the Payments module's controller (not payments.service) to keep the two modules decoupled. */
  async applyPaymentOutcome(orderId: string, outcome: 'CAPTURED' | 'FAILED', meta?: { utrReference?: string }) {
    const order = await ordersRepository.findByIdOrOrderId(orderId);
    if (!order) throw new NotFoundError('Order not found for payment outcome');

    if (outcome === 'CAPTURED') {
      if (order.status !== OrderStatus.PENDING_PAYMENT) throw new ConflictError('Order is not awaiting payment');
      const updated = await ordersRepository.appendStatus(
        order._id.toString(),
        { status: OrderStatus.ORDER_PLACED, changedAt: new Date(), note: 'Payment captured' },
        { paymentStatus: PaymentStatus.CAPTURED, utrReference: meta?.utrReference },
      );
      await notifyUser(order.passengerId.toString(), NotificationEvent.ORDER_PLACED, 'Order placed', `Your order ${order.orderId} has been placed.`);
      await notifyAdmins(
        NotificationEvent.ORDER_PLACED,
        'New order received',
        `Order ${order.orderId} — ₹${(order.grandTotal / 100).toFixed(2)}`,
      );
      return updated;
    }

    const updated = await ordersRepository.appendStatus(
      order._id.toString(),
      { status: OrderStatus.PAYMENT_FAILED, changedAt: new Date(), note: 'Payment failed' },
      { paymentStatus: PaymentStatus.FAILED },
    );
    await notifyUser(order.passengerId.toString(), NotificationEvent.ORDER_CANCELLED, 'Payment failed', `Payment for order ${order.orderId} failed.`);
    return updated;
  },
};
