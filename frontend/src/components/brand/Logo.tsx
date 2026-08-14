import { Train, Utensils } from "lucide-react";
import { APP_THEME, APP_NAME } from "@/lib/brand";

export function Logo({ compact = false }: { compact?: boolean }) {
  if (APP_THEME === "red") {
    return (
      <div className="flex items-center gap-2 select-none">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.58_0.215_29)] text-white shadow-pop">
          <span className="font-display font-black text-lg leading-none">SR</span>
        </div>
        {!compact && (
          <div className="leading-none">
            <div className="flex items-baseline gap-0.5 font-display font-extrabold text-xl tracking-tight">
              <span className="text-navy">SHREE</span>
              <span className="text-primary"> RADHE</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
              Foods
            </div>
          </div>
        )}
      </div>
    );
  }

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
            {APP_NAME}
          </div>
        </div>
      )}
    </div>
  );
}
