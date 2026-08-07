import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "home-categories", label: "Categories" },
  { id: "home-menu-items", label: "Menu Items" },
];

const SCROLL_OFFSET = 150;

export function HomeSectionTabs() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - SCROLL_OFFSET <= 0) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (SCROLL_OFFSET - 10);
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="sticky top-[72px] z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 bg-background/95 backdrop-blur-md border-b">
      <div className="flex gap-2 max-w-[1400px] mx-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              active === s.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
