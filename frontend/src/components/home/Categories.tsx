import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getCategories } from "@/features/menu/services/menuApi";

const SWATCHES = [
  "oklch(0.95 0.08 145)",
  "oklch(0.95 0.1 30)",
  "oklch(0.96 0.1 80)",
  "oklch(0.95 0.08 40)",
  "oklch(0.95 0.08 300)",
  "oklch(0.95 0.08 0)",
  "oklch(0.95 0.08 60)",
];

export function Categories() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-categories"],
    queryFn: getCategories,
  });
  const categories = data ?? [];

  return (
    <section id="home-categories" className="space-y-4 scroll-mt-36">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Link to="/categories" className="text-sm font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-7">
          {categories.map((c, idx) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to="/menu"
                search={{ category: c.slug } as never}
                className="block shrink-0 w-32 md:w-auto bg-card border rounded-xl p-3 text-center hover:shadow-card hover:border-primary/30 transition"
              >
                <div
                  className="w-12 h-12 mx-auto rounded-full grid place-items-center text-xl mb-2"
                  style={{ background: SWATCHES[idx % SWATCHES.length] }}
                >
                  {c.icon}
                </div>
                <div className="text-sm font-semibold mb-2">{c.name}</div>
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
