/** Mirrors the backend's ORDER_STATUS_TRANSITIONS (src/types/domain.types.ts) — used only to populate the admin "next status" picker with valid choices; the backend re-validates and is the actual source of truth. */
const TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["ORDER_PLACED", "PAYMENT_FAILED"],
  PAYMENT_FAILED: [],
  ORDER_PLACED: ["RESTAURANT_NOTIFIED", "CANCELLED_BY_PASSENGER", "CANCELLED_BY_ADMIN"],
  RESTAURANT_NOTIFIED: [
    "RESTAURANT_ACCEPTED",
    "RESTAURANT_REJECTED",
    "CANCELLED_BY_PASSENGER",
    "CANCELLED_BY_ADMIN",
  ],
  RESTAURANT_ACCEPTED: ["PREPARING", "CANCELLED_BY_RESTAURANT", "CANCELLED_BY_ADMIN"],
  RESTAURANT_REJECTED: ["REFUND_INITIATED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED_BY_RESTAURANT", "CANCELLED_BY_ADMIN"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  DELIVERY_FAILED: ["REFUND_INITIATED"],
  CANCELLED_BY_PASSENGER: ["REFUND_INITIATED"],
  CANCELLED_BY_RESTAURANT: ["REFUND_INITIATED"],
  CANCELLED_BY_ADMIN: ["REFUND_INITIATED"],
  REFUND_INITIATED: ["REFUND_PROCESSED", "REFUND_FAILED"],
  REFUND_PROCESSED: [],
  REFUND_FAILED: ["REFUND_INITIATED"],
  COMPLETED: ["DISPUTED"],
  DISPUTED: ["REFUND_INITIATED", "COMPLETED"],
};

const LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_FAILED: "Payment Failed",
  ORDER_PLACED: "Order Placed",
  RESTAURANT_NOTIFIED: "Restaurant Notified",
  RESTAURANT_ACCEPTED: "Accepted",
  RESTAURANT_REJECTED: "Rejected",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  DELIVERY_FAILED: "Delivery Failed",
  CANCELLED_BY_PASSENGER: "Cancelled by Passenger",
  CANCELLED_BY_RESTAURANT: "Cancelled by Restaurant",
  CANCELLED_BY_ADMIN: "Cancelled by Admin",
  REFUND_INITIATED: "Refund Initiated",
  REFUND_PROCESSED: "Refund Processed",
  REFUND_FAILED: "Refund Failed",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
};

export function nextValidStatuses(currentStatus: string): string[] {
  return TRANSITIONS[currentStatus] ?? [];
}

export function statusLabel(status: string): string {
  return LABELS[status] ?? status;
}
