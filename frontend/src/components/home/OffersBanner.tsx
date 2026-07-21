import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Tag, Copy } from "lucide-react";
import { toast } from "sonner";
import { listActiveCoupons } from "@/features/coupons/services/couponsApi";
import { paiseToRupees } from "@/features/menu/mappers";

export function OffersBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ["active-coupons"],
    queryFn: listActiveCoupons,
  });
  const offers = data ?? [];

  if (isLoading || !offers.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Today's Offers</h2>
        <Link to="/offers" className="text-sm font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
        {offers.map((o, idx) => (
          <motion.div
            key={o.code}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="shrink-0 w-[300px] snap-start"
          >
            <div className="relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-[oklch(0.48_0.19_25)] text-primary-foreground p-5 shadow-card">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute right-8 bottom-2 w-16 h-16 rounded-full bg-white/10" />
              <div className="relative flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-full bg-white/20 grid place-items-center shrink-0">
                  <Tag className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                  Limited time
                </span>
              </div>
              <div className="relative text-3xl font-extrabold leading-none">
                {o.discountType === "FLAT"
                  ? `₹${paiseToRupees(o.discountValue)} OFF`
                  : `${o.discountValue}% OFF`}
              </div>
              <p className="relative text-sm opacity-90 mt-1.5 min-h-[2.5rem]">{o.description}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(o.code);
                  toast.success(`Copied ${o.code}`);
                }}
                className="relative mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-dashed border-white/40 bg-white/10 text-sm font-mono font-bold hover:bg-white/20 transition"
              >
                {o.code} <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
