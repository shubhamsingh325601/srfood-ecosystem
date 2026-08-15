import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useCartStore, selectCartCount, selectCartTotal } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";

export function FloatingCartBar() {
  const count = useCartStore(selectCartCount);
  const total = useCartStore(selectCartTotal);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50">
      <div className="bg-card border rounded-2xl shadow-pop p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">
            {count} item{count !== 1 ? "s" : ""} in cart
          </div>
          <div className="text-lg font-bold text-primary">₹{total}</div>
        </div>
        <Button asChild size="sm" className="rounded-full h-10 px-5">
          <Link to="/checkout">
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            Checkout
          </Link>
        </Button>
      </div>
    </div>
  );
}
