import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { FoodCard } from "@/components/home/FoodCard";
import { Button } from "@/components/ui/button";
import { getMenu } from "@/features/menu/services/menuApi";
import { buildCategoryNameMap, mapMenuItemToFood } from "@/features/menu/mappers";
import { useFavoritesStore } from "@/store/favoritesStore";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "My Favourites – SRFOOD" }] }),
  component: FavoritesPage,
});

function useFavoriteFoods(ids: string[]) {
  return useQuery({
    queryKey: ["favorite-foods", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { categories, items } = await getMenu();
      const nameMap = buildCategoryNameMap(categories);
      return items
        .filter((i) => ids.includes(i._id))
        .map((i) => mapMenuItemToFood(i, nameMap.get(i.categoryId) ?? ""));
    },
  });
}

function FavoritesPage() {
  const ids = useFavoritesStore((s) => s.ids);
  const { data, isLoading } = useFavoriteFoods(ids);
  const foods = data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold mb-5">My Favourites</h1>
      {ids.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <div className="font-semibold">No favourites yet</div>
          <p className="text-sm text-muted-foreground mt-1">
            Tap the heart icon on any dish to save it here.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/menu">Browse Menu</Link>
          </Button>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {foods.map((f) => (
            <FoodCard key={f.id} food={f} />
          ))}
        </div>
      )}
    </div>
  );
}
