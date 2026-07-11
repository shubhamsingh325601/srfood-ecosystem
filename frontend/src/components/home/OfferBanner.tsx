import { useQuery } from "@tanstack/react-query";
import { Bike, Flame, Clock, MapPin } from "lucide-react";
import { getHomepage } from "@/features/cms/services/cmsApi";

export function OfferBanner() {
  const { data } = useQuery({
    queryKey: ["cms-homepage"],
    queryFn: () => getHomepage().catch(() => null),
  });
  const offer = data?.offer;
  if (!offer) return null;
  return (
    <section className="rounded-2xl bg-gradient-to-r from-[oklch(0.97_0.04_55)] to-[oklch(0.96_0.06_45)] border p-6 md:p-8 grid md:grid-cols-3 items-center gap-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-primary">Flat</div>
        <div className="text-5xl font-extrabold text-primary leading-none">
          {offer.percent}% OFF
        </div>
        <div className="text-sm text-muted-foreground mt-1">{offer.headline}</div>
        <div className="mt-3 inline-block px-3 py-1.5 rounded-md border-2 border-dashed border-primary/50 bg-background/60 text-sm font-mono font-bold">
          Use Code: <span className="text-primary">{offer.code}</span>
        </div>
      </div>

      <div className="hidden md:flex justify-center">
        <div className="w-28 h-28 rounded-full bg-primary/15 grid place-items-center">
          <Bike className="w-14 h-14 text-primary" />
        </div>
      </div>

      <div>
        <h3 className="text-xl md:text-2xl font-bold leading-tight">
          {offer.sub.split(" ").slice(0, 2).join(" ")}
          <br />
          <span className="text-primary">{offer.sub.split(" ").slice(2).join(" ")}</span>
        </h3>
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
          {[
            { I: Flame, t: "Hygienic Food" },
            { I: Clock, t: "On Time Delivery" },
            { I: MapPin, t: "Live Order Tracking" },
          ].map(({ I, t }) => (
            <div
              key={t}
              className="flex flex-col items-center gap-1 text-primary font-semibold text-center"
            >
              <I className="w-5 h-5" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
