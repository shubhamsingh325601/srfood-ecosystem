import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tag, Copy } from "lucide-react";
import { toast } from "sonner";
import { listActiveCoupons } from "@/features/coupons/services/couponsApi";
import { paiseToRupees } from "@/features/menu/mappers";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Offers – SRFOOD" }] }),
  component: OffersPage,
});

function OffersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["active-coupons"],
    queryFn: listActiveCoupons,
  });
  const offers = data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold mb-5">Offers & Coupons</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !offers.length ? (
        <p className="text-sm text-muted-foreground">
          No active offers right now — check back soon.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {offers.map((o) => (
            <div
              key={o.code}
              className="bg-gradient-to-br from-primary/10 to-cream border rounded-2xl p-5 flex gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-extrabold text-primary">
                  {o.discountType === "FLAT"
                    ? `₹${paiseToRupees(o.discountValue)} OFF`
                    : `${o.discountValue}% OFF`}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{o.description}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(o.code);
                    toast.success(`Copied ${o.code}`);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-dashed border-primary/50 bg-background text-sm font-mono font-bold hover:bg-primary/5"
                >
                  {o.code} <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
