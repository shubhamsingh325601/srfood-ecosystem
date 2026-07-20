import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChefHat, Bike, PackageCheck, Circle } from "lucide-react";
import { listOrders } from "@/features/orders/services/ordersApi";
import { toDisplayStatus, type DisplayStatus } from "@/features/orders/statusDisplay";
import { paiseToRupees } from "@/features/menu/mappers";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order – SRFOOD" }] }),
  component: TrackPage,
});

const stages: DisplayStatus[] = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
const icons = [Check, ChefHat, Bike, PackageCheck];

function TrackPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["latest-order"],
    queryFn: () => listOrders({ limit: 1 }),
  });
  const latest = data?.items[0];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-muted-foreground">Loading…</div>
    );
  }
  if (!latest) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-muted-foreground">No active orders to track.</p>
      </div>
    );
  }
  const display = toDisplayStatus(latest.status);
  const idx = display === "Cancelled" ? -1 : stages.indexOf(display);
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold">Track Order #{latest.orderId}</h1>
      <p className="text-muted-foreground text-sm">
        {latest.deliveryAddress.line}, {latest.deliveryAddress.city}
      </p>

      {display === "Cancelled" ? (
        <div className="mt-8 bg-card border rounded-2xl p-6 text-center">
          <p className="font-semibold text-destructive">This order was cancelled.</p>
        </div>
      ) : (
        <div className="mt-8 bg-card border rounded-2xl p-6">
          <div className="grid grid-cols-4 gap-2">
            {stages.map((s, i) => {
              const I = icons[i];
              const active = i <= idx;
              return (
                <div key={s} className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full grid place-items-center border-2 ${active ? "bg-primary text-primary-foreground border-primary" : "border-muted text-muted-foreground"}`}
                  >
                    {active ? <I className="w-5 h-5" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((idx + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 bg-card border rounded-2xl p-5">
        <h2 className="font-bold mb-3">Items</h2>
        {latest.items.map((it) => (
          <div key={it.menuItemId} className="flex justify-between text-sm py-1">
            <span>
              {it.name} × {it.quantity}
            </span>
            <span>₹{paiseToRupees(it.price * it.quantity)}</span>
          </div>
        ))}
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>₹{paiseToRupees(latest.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
