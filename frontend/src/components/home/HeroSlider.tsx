import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getHomepage } from "@/features/cms/services/cmsApi";
import heroThali from "@/assets/hero-thali.jpg";

export function HeroSlider() {
  const { data } = useQuery({
    queryKey: ["cms-homepage"],
    queryFn: () => getHomepage().catch(() => null),
  });
  const slides = data?.hero ?? [];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[i] ?? slides[0];
  if (!s) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.97_0.03_60)] via-cream to-[oklch(0.95_0.04_50)] border shadow-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-6 items-center px-6 md:px-10 py-8 md:py-12 min-h-[340px] md:min-h-[400px]"
        >
          <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              <span className="text-navy">{s.eyebrow}</span>
              <br />
              <span className="text-primary">{s.title}</span>
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full" />
            <p className="text-muted-foreground text-base md:text-lg max-w-md">{s.desc}</p>
            <Button size="lg" asChild className="rounded-full h-12 px-6 gap-2 shadow-pop">
              <Link to="/menu">
                {s.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -top-2 right-4 md:right-8 z-10 w-20 h-20 rounded-full bg-primary text-primary-foreground grid place-items-center text-[10px] font-bold uppercase tracking-wider text-center leading-tight shadow-pop rotate-[-8deg]">
              <div>
                <Clock className="w-4 h-4 mx-auto mb-0.5" />
                Fresh
                <br />
                On Time
              </div>
            </div>
            <motion.img
              src={heroThali}
              alt="Fresh thali"
              width={1024}
              height={768}
              className="w-full aspect-square object-cover rounded-2xl shadow-card"
              initial={{ scale: 0.95, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
