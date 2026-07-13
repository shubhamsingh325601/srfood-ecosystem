export enum UserRole {
  PASSENGER = 'PASSENGER',
  SUPPORT_EXEC = 'SUPPORT_EXEC',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const;

/** PRD §14 full status enum. */
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_PLACED = 'ORDER_PLACED',
  RESTAURANT_NOTIFIED = 'RESTAURANT_NOTIFIED',
  RESTAURANT_ACCEPTED = 'RESTAURANT_ACCEPTED',
  RESTAURANT_REJECTED = 'RESTAURANT_REJECTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  CANCELLED_BY_PASSENGER = 'CANCELLED_BY_PASSENGER',
  CANCELLED_BY_RESTAURANT = 'CANCELLED_BY_RESTAURANT',
  CANCELLED_BY_ADMIN = 'CANCELLED_BY_ADMIN',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  REFUND_FAILED = 'REFUND_FAILED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
}

/**
 * Maps every granular PRD status to the 5 flat display buckets the existing,
 * approved frontend UI already renders (`orders.tsx`, `track.tsx`) — chosen so
 * no frontend visual change is required (per Frontend_Screen_Audit.md §E).
 */
export enum OrderDisplayStatus {
  PLACED = 'Placed',
  PREPARING = 'Preparing',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export const ORDER_STATUS_DISPLAY_MAP: Record<OrderStatus, OrderDisplayStatus> = {
  [OrderStatus.PENDING_PAYMENT]: OrderDisplayStatus.PLACED,
  [OrderStatus.ORDER_PLACED]: OrderDisplayStatus.PLACED,
  [OrderStatus.RESTAURANT_NOTIFIED]: OrderDisplayStatus.PLACED,
  [OrderStatus.RESTAURANT_ACCEPTED]: OrderDisplayStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderDisplayStatus.PREPARING,
  [OrderStatus.READY_FOR_PICKUP]: OrderDisplayStatus.OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderDisplayStatus.OUT_FOR_DELIVERY,
  [OrderStatus.DELIVERED]: OrderDisplayStatus.DELIVERED,
  [OrderStatus.COMPLETED]: OrderDisplayStatus.DELIVERED,
  [OrderStatus.PAYMENT_FAILED]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.RESTAURANT_REJECTED]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.DELIVERY_FAILED]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.CANCELLED_BY_PASSENGER]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.CANCELLED_BY_RESTAURANT]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.CANCELLED_BY_ADMIN]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.REFUND_INITIATED]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.REFUND_PROCESSED]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.REFUND_FAILED]: OrderDisplayStatus.CANCELLED,
  [OrderStatus.DISPUTED]: OrderDisplayStatus.CANCELLED,
};

/** Allowed forward transitions — PRD §14 state machine. Enforced server-side only. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.ORDER_PLACED, OrderStatus.PAYMENT_FAILED],
  [OrderStatus.PAYMENT_FAILED]: [],
  [OrderStatus.ORDER_PLACED]: [OrderStatus.RESTAURANT_NOTIFIED, OrderStatus.CANCELLED_BY_PASSENGER, OrderStatus.CANCELLED_BY_ADMIN],
  [OrderStatus.RESTAURANT_NOTIFIED]: [
    OrderStatus.RESTAURANT_ACCEPTED,
    OrderStatus.RESTAURANT_REJECTED,
    OrderStatus.CANCELLED_BY_PASSENGER,
    OrderStatus.CANCELLED_BY_ADMIN,
  ],
  [OrderStatus.RESTAURANT_ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED_BY_RESTAURANT, OrderStatus.CANCELLED_BY_ADMIN],
  [OrderStatus.RESTAURANT_REJECTED]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED_BY_RESTAURANT, OrderStatus.CANCELLED_BY_ADMIN],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.CANCELLED_BY_PASSENGER]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.CANCELLED_BY_RESTAURANT]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.CANCELLED_BY_ADMIN]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.REFUND_INITIATED]: [OrderStatus.REFUND_PROCESSED, OrderStatus.REFUND_FAILED],
  [OrderStatus.REFUND_PROCESSED]: [],
  [OrderStatus.REFUND_FAILED]: [OrderStatus.REFUND_INITIATED],
  [OrderStatus.COMPLETED]: [OrderStatus.DISPUTED],
  [OrderStatus.DISPUTED]: [OrderStatus.REFUND_INITIATED, OrderStatus.COMPLETED],
};

export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAYMENT_FAILED,
  OrderStatus.REFUND_PROCESSED,
  OrderStatus.COMPLETED,
];

export enum PaymentMode {
  ONLINE = 'online',
  COD = 'cod',
}

export enum PaymentMethod {
  UPI = 'UPI',
  COD = 'COD',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund',
}

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}

export enum NotificationEvent {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  ORDER_REJECTED = 'ORDER_REJECTED',
  ORDER_OUT_FOR_DELIVERY = 'ORDER_OUT_FOR_DELIVERY',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  SUPPORT_TICKET_UPDATED = 'SUPPORT_TICKET_UPDATED',
  ACCOUNT_OTP = 'ACCOUNT_OTP',
}

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum CmsContentType {
  HOMEPAGE = 'homepage',
  FAQ = 'faq',
  LEGAL_PRIVACY = 'legal_privacy',
  LEGAL_TERMS = 'legal_terms',
  SETTINGS = 'settings',
}
