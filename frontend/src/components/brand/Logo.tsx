import { Train, Utensils } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.22_30)] text-white shadow-pop">
        <Train className="w-5 h-5 absolute" strokeWidth={2.5} />
        <Utensils className="w-3 h-3 absolute -top-1 -right-1 bg-navy text-primary p-0.5 rounded-full" />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="flex items-baseline gap-0.5 font-display font-extrabold text-xl tracking-tight">
            <span className="text-navy">SR</span>
            <span className="text-primary">FOOD</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
            Shreeradhefood
          </div>
        </div>
      )}
    </div>
  );
}
