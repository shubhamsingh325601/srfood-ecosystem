export interface CreateOrderCartItem {
  menuItemId: string;
  quantity: number;
  customizations: { groupName: string; optionLabel: string }[];
  specialNote?: string;
}

export interface CreateOrderPayload {
  cart: {
    items: CreateOrderCartItem[];
    couponCode?: string;
  };
  paymentMethod: "Card" | "UPI" | "COD" | "Wallet";
  pnr?: string;
  coach?: string;
  seat?: string;
  trainNumber?: string;
  boardingStation?: string;
  deliveryStation: string;
}

export interface RazorpayPaymentInfo {
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export interface ApiOrder {
  _id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  items: { menuItemId: string; name: string; price: number; quantity: number }[];
  pnr?: string;
  coach?: string;
  seat?: string;
  deliveryStation: string;
}

export interface CreateOrderResult {
  order: ApiOrder;
  payment: RazorpayPaymentInfo | null;
  replay: boolean;
}
