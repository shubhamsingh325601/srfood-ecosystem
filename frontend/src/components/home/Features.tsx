import { Shield, Clock, MapPin, Headphones } from "lucide-react";

const items = [
  { I: Shield, t: "Hygienic & Safe", d: "Prepared with maximum care and hygiene", c: "oklch(0.95 0.08 145)", ic: "oklch(0.55 0.18 145)" },
  { I: Clock, t: "On Time Delivery", d: "Your food delivered on time, every time", c: "oklch(0.96 0.08 55)", ic: "oklch(0.65 0.2 45)" },
  { I: MapPin, t: "Live Tracking", d: "Track your order in real-time", c: "oklch(0.95 0.07 240)", ic: "oklch(0.55 0.2 250)" },
  { I: Headphones, t: "24/7 Support", d: "We're here to help you anytime", c: "oklch(0.95 0.06 290)", ic: "oklch(0.55 0.2 290)" },
];

export function Features() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ I, t, d, c, ic }) => (
        <div key={t} className="bg-card border rounded-xl p-4 flex items-start gap-3 hover:shadow-card transition">
          <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: c }}>
            <I className="w-5 h-5" style={{ color: ic }} />
          </div>
          <div>
            <div className="font-semibold text-primary text-sm">{t}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{d}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
