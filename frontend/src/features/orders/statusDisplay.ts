/** Mirrors the backend's ORDER_STATUS_DISPLAY_MAP (src/types/domain.types.ts) — maps the PRD's 19-state order status to the 5 display buckets this UI already renders. */
export type DisplayStatus = "Placed" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";

const STATUS_DISPLAY_MAP: Record<string, DisplayStatus> = {
  PENDING_PAYMENT: "Placed",
  ORDER_PLACED: "Placed",
  RESTAURANT_NOTIFIED: "Placed",
  RESTAURANT_ACCEPTED: "Preparing",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Out for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Delivered",
  PAYMENT_FAILED: "Cancelled",
  RESTAURANT_REJECTED: "Cancelled",
  DELIVERY_FAILED: "Cancelled",
  CANCELLED_BY_PASSENGER: "Cancelled",
  CANCELLED_BY_RESTAURANT: "Cancelled",
  CANCELLED_BY_ADMIN: "Cancelled",
  REFUND_INITIATED: "Cancelled",
  REFUND_PROCESSED: "Cancelled",
  REFUND_FAILED: "Cancelled",
  DISPUTED: "Cancelled",
};

export function toDisplayStatus(status: string): DisplayStatus {
  return STATUS_DISPLAY_MAP[status] ?? "Placed";
}
