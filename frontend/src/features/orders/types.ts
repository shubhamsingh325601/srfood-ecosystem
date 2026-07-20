export interface CreateOrderCartItem {
  menuItemId: string;
  quantity: number;
  customizations: { groupName: string; optionLabel: string }[];
  specialNote?: string;
}

export interface DeliveryAddress {
  line: string;
  landmark?: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

export interface CreateOrderPayload {
  cart: {
    items: CreateOrderCartItem[];
    couponCode?: string;
  };
  paymentMethod: "UPI" | "COD";
  customerName: string;
  customerMobile: string;
  deliveryAddress: DeliveryAddress;
}

export interface UpiPaymentInfo {
  upiLink: string;
  payeeVpa: string;
  payeeName: string;
  amountPaise: number;
  currency: string;
  transactionRef: string;
}

export interface ApiOrder {
  _id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  items: { menuItemId: string; name: string; price: number; quantity: number }[];
  customerName: string;
  customerMobile: string;
  deliveryAddress: DeliveryAddress;
}

export interface CreateOrderResult {
  order: ApiOrder;
  payment: UpiPaymentInfo | null;
  replay: boolean;
}
