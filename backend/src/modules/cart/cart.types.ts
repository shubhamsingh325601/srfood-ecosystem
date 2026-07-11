export interface ValidatedCartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: { groupName: string; optionLabel: string; priceDeltaPaise: number }[];
  specialNote?: string;
  itemTotal: number;
}

export interface ValidatedCart {
  items: ValidatedCartItem[];
  subtotal: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  gstAmountPaise: number;
  couponId?: string;
  couponCode?: string;
  couponDiscountPaise: number;
  grandTotal: number;
}
