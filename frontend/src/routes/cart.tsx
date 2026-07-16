import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, selectCartTotal } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validateCoupon } from "@/features/coupons/services/couponsApi";
import { getApiErrorMessage } from "@/lib/axios";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart – SRFOOD" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const cartTotal = useCartStore(selectCartTotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const couponCode = useCartStore((s) => s.couponCode);
  const couponDiscountPaise = useCartStore((s) => s.couponDiscountPaise);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  const gst = Math.round(cartTotal * 0.05);
  const delivery = cartTotal > 0 ? 29 : 0;
  const discount = Math.round(couponDiscountPaise / 100);
  const grand = Math.max(0, cartTotal + gst + delivery - discount);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const result = await validateCoupon(code, Math.round(cartTotal * 100));
      applyCoupon(result.code, result.discountPaise);
      toast.success(`Coupon ${result.code} applied — you saved ₹${Math.round(result.discountPaise / 100)}`);
      setCouponInput("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "This coupon isn't valid for your cart"));
    } finally {
      setApplying(false);
    }
  };

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40" />
        <h1 className="text-2xl font-bold mt-4">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add tasty meals from our menu to get started.</p>
        <Button asChild size="lg" className="mt-6 rounded-full">
          <Link to="/menu">Browse Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Cart ({items.length})</h1>
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.menuItemId}
              className="bg-card border rounded-xl p-3 flex gap-3 items-center"
            >
              <img src={it.image} alt={it.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 border-2 grid place-items-center ${it.veg ? "border-green-600" : "border-red-600"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${it.veg ? "bg-green-600" : "bg-red-600"}`}
                    />
                  </span>
                  <h3 className="font-semibold truncate">{it.name}</h3>
                </div>
                <div className="font-bold text-primary mt-1">₹{it.price}</div>
              </div>
              <div className="flex items-center gap-2 border rounded-full p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setQuantity(it.menuItemId, it.quantity - 1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm font-bold w-4 text-center">{it.quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setQuantity(it.menuItemId, it.quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeItem(it.menuItemId)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <button
          onClick={clear}
          className="text-sm text-muted-foreground hover:text-destructive mt-4"
        >
          Clear cart
        </button>
      </div>

      <aside className="bg-card border rounded-2xl p-5 h-fit sticky top-[88px] space-y-3">
        <h2 className="font-bold text-lg">Bill Details</h2>

        {couponCode ? (
          <div className="flex items-center justify-between text-sm bg-success/10 text-success rounded-lg px-3 py-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {couponCode} applied
            </span>
            <button
              onClick={removeCoupon}
              aria-label="Remove coupon"
              className="hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code"
                className="h-9"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={applying || !couponInput.trim()}
              >
                {applying ? "…" : "Apply"}
              </Button>
            </div>
            <Link to="/offers" className="text-xs text-primary hover:underline">
              View available offers →
            </Link>
          </div>
        )}

        <Row label="Item Total" value={`₹${cartTotal}`} />
        <Row label="GST (5%)" value={`₹${gst}`} />
        <Row label="Delivery Fee" value={`₹${delivery}`} />
        {discount > 0 && <Row label="Coupon Discount" value={`-₹${discount}`} />}
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>To Pay</span>
          <span>₹{grand}</span>
        </div>
        <Button asChild size="lg" className="w-full rounded-full h-12 gap-2 mt-2">
          <Link to="/checkout">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
