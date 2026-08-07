import { useQuery } from "@tanstack/react-query";
import { FoodCard } from "./FoodCard";
import { getMenu } from "@/features/menu/services/menuApi";
import { buildCategoryNameMap, mapMenuItemToFood } from "@/features/menu/mappers";

export function MenuItems() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-menu-items"],
    queryFn: async () => {
      const { categories, items } = await getMenu();
      const nameMap = buildCategoryNameMap(categories);
      const foods = items.map((item) => mapMenuItemToFood(item, nameMap.get(item.categoryId) ?? ""));
      return foods.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
    },
  });
  const foods = data ?? [];

  return (
    <section id="home-menu-items" className="space-y-4 scroll-mt-36">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Menu Items</h2>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : foods.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items available right now.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {foods.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      )}
    </section>
  );
}
