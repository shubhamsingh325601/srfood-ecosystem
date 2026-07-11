import { PRICING } from '@/config/constants';
import { MenuItem, type MenuItemDocument } from '@/models/MenuItem.model';
import { couponsService } from '@/modules/coupons/coupons.service';
import { BadRequestError, NotFoundError } from '@/utils/errors';

import type { CartItemInput, ValidateCartInput } from './cart.dto';
import type { ValidatedCart, ValidatedCartItem } from './cart.types';

function resolveCustomizationPrice(item: MenuItemDocument, input: CartItemInput): { priceDeltaTotal: number; resolved: ValidatedCartItem['customizations'] } {
  const resolved: ValidatedCartItem['customizations'] = [];
  let priceDeltaTotal = 0;

  for (const selection of input.customizations) {
    const group = item.customizations.find((g) => g.name === selection.groupName);
    if (!group) throw new BadRequestError(`"${item.name}" has no customization group "${selection.groupName}"`);
    const option = group.options.find((o) => o.label === selection.optionLabel);
    if (!option) throw new BadRequestError(`"${item.name}" / "${selection.groupName}" has no option "${selection.optionLabel}"`);
    resolved.push({ groupName: selection.groupName, optionLabel: option.label, priceDeltaPaise: option.priceDeltaPaise });
    priceDeltaTotal += option.priceDeltaPaise;
  }

  for (const group of item.customizations.filter((g) => g.isRequired)) {
    if (!input.customizations.some((s) => s.groupName === group.name)) {
      throw new BadRequestError(`"${item.name}" requires a selection for "${group.name}"`);
    }
  }

  return { priceDeltaTotal, resolved };
}

export const cartService = {
  /** Recomputes cart pricing entirely server-side — never trusts client-submitted prices/totals. Reused by Orders at checkout. */
  async validateCart(input: ValidateCartInput, userId?: string): Promise<ValidatedCart> {
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, isDeleted: false });
    const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

    if (menuItemMap.size !== new Set(menuItemIds).size) {
      throw new NotFoundError('One or more menu items in your cart could not be found');
    }

    const items: ValidatedCartItem[] = input.items.map((inputItem) => {
      const menuItem = menuItemMap.get(inputItem.menuItemId);
      if (!menuItem) throw new NotFoundError('Menu item not found');
      if (!menuItem.isAvailable) throw new BadRequestError(`"${menuItem.name}" is currently out of stock`);

      const { priceDeltaTotal, resolved } = resolveCustomizationPrice(menuItem, inputItem);
      const unitPrice = menuItem.price + priceDeltaTotal;

      return {
        menuItemId: menuItem._id.toString(),
        name: menuItem.name,
        price: unitPrice,
        quantity: inputItem.quantity,
        customizations: resolved,
        specialNote: inputItem.specialNote,
        itemTotal: unitPrice * inputItem.quantity,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);

    if (subtotal < PRICING.MIN_ORDER_VALUE_PAISE) {
      throw new BadRequestError(`Minimum order value is ₹${PRICING.MIN_ORDER_VALUE_PAISE / 100}`);
    }

    const deliveryFeePaise = PRICING.DELIVERY_FEE_PAISE;
    const platformFeePaise = PRICING.PLATFORM_FEE_PAISE;
    const gstAmountPaise = Math.round(subtotal * (PRICING.GST_PERCENT / 100));

    let couponDiscountPaise = 0;
    let couponId: string | undefined;
    if (input.couponCode) {
      const result = await couponsService.validate(input.couponCode, subtotal, userId);
      couponDiscountPaise = result.discountPaise;
      couponId = result.coupon._id.toString();
    }

    const grandTotal = subtotal + deliveryFeePaise + platformFeePaise + gstAmountPaise - couponDiscountPaise;

    return {
      items,
      subtotal,
      deliveryFeePaise,
      platformFeePaise,
      gstAmountPaise,
      couponId,
      couponCode: input.couponCode,
      couponDiscountPaise,
      grandTotal,
    };
  },
};
