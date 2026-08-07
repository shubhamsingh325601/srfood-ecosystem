import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Search, SlidersHorizontal } from "lucide-react";
import { FoodCard } from "@/components/home/FoodCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getMenu } from "@/features/menu/services/menuApi";
import { buildCategoryNameMap, mapMenuItemToFood } from "@/features/menu/mappers";

const menuSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/menu")({
  validateSearch: menuSearchSchema,
  head: () => ({
    meta: [
      { title: "Menu – SRFOOD" },
      {
        name: "description",
        content: "Browse our full menu of thalis, biryanis, snacks, beverages and desserts.",
      },
    ],
  }),
  component: MenuPage,
});

type Diet = "all" | "veg";
type Sort = "popular" | "price-asc" | "price-desc" | "rating";

function useMenuData() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { categories, items } = await getMenu();
      const nameMap = buildCategoryNameMap(categories);
      return {
        categories,
        foods: items.map((item) => mapMenuItemToFood(item, nameMap.get(item.categoryId) ?? "")),
      };
    },
  });
}

function MenuPage() {
  const search = Route.useSearch();
  const { data, isLoading, isError } = useMenuData();
  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState<string>("All");
  const [diet, setDiet] = useState<Diet>("all");
  const [sort, setSort] = useState<Sort>("popular");

  const foods = data?.foods ?? [];
  const categories = data?.categories ?? [];
  const categoryNames = categories.map((c) => c.name);

  useEffect(() => {
    if (!search.category || !categories.length) return;
    const match = categories.find((c) => c.slug === search.category);
    if (match) setCat(match.name);
  }, [search.category, categories]);

  useEffect(() => {
    setQ(search.q ?? "");
  }, [search.q]);

  const items = useMemo(() => {
    let r = foods.filter(
      (f) =>
        (cat === "All" || f.category === cat) &&
        (diet === "all" || f.veg) &&
        (q === "" ||
          f.name.toLowerCase().includes(q.toLowerCase()) ||
          f.desc.toLowerCase().includes(q.toLowerCase())),
    );
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    else if (sort === "rating") r = [...r].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return r;
  }, [foods, q, cat, diet, sort]);

  return (
    <div className="px-4 md:px-6 py-5 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fresh, hygienic meals — delivered across Kota & Sawai Madhopur.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes…"
            className="pl-10 h-12 rounded-full bg-muted border-transparent focus-visible:bg-background"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {["All", ...categoryNames].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                cat === c
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card hover:border-primary/40 hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Diet + sort */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          {(["all", "veg"] as Diet[]).map((d) => (
            <Button
              key={d}
              size="sm"
              variant={diet === d ? "default" : "outline"}
              onClick={() => setDiet(d)}
              className="rounded-full h-9 px-4 capitalize"
            >
              {d === "all" ? "All" : "🌱 Veg"}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-full border bg-card px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="popular">Popular</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{items.length} dishes</div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <div className="text-5xl mb-3">⏳</div>
          <div className="font-semibold">Loading menu…</div>
        </div>
      ) : isError ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <div className="text-5xl mb-3">⚠️</div>
          <div className="font-semibold">Could not load the menu</div>
          <p className="text-sm text-muted-foreground mt-1">Please try again shortly.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <div className="text-5xl mb-3">🍽️</div>
          <div className="font-semibold">No dishes match your filters</div>
          <p className="text-sm text-muted-foreground mt-1">
            Try clearing the search or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      )}
    </div>
  );
}
