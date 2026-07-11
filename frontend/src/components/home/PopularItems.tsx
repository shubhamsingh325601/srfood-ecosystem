import { useQuery } from "@tanstack/react-query";
import { FoodCard } from "./FoodCard";
import { getPopularItems } from "@/features/menu/services/menuApi";
import { mapMenuItemToFood } from "@/features/menu/mappers";

export function PopularItems() {
  const { data } = useQuery({
    queryKey: ["popular-items"],
    queryFn: async () => {
      const items = await getPopularItems(5);
      return items.map((item) => mapMenuItemToFood(item, ""));
    },
  });
  const popular = data ?? [];

  if (popular.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Popular Items</h2>
        <button className="text-sm font-semibold text-primary hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {popular.map((f) => (
          <FoodCard key={f.id} food={f} />
        ))}
      </div>
    </section>
  );
}
