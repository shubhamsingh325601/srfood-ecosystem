import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Heart,
  Minus,
  Plus,
  Star,
  ShoppingCart,
  ChevronLeft,
  Clock,
  Flame,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FoodCard } from "@/components/home/FoodCard";
import { getMenu, getMenuItem } from "@/features/menu/services/menuApi";
import { buildCategoryNameMap, mapMenuItemToFood } from "@/features/menu/mappers";
import { getMenuItemRatings } from "@/features/ratings/services/ratingsApi";
import { useCartStore } from "@/store/cartStore";

export const Route = createFileRoute("/food/$id")({
  head: () => ({ meta: [{ title: "Dish – SRFOOD" }] }),
  component: FoodDetailPage,
});

function useFoodDetail(id: string) {
  return useQuery({
    queryKey: ["food-detail", id],
    queryFn: async () => {
      const item = await getMenuItem(id);
      const { categories, items } = await getMenu();
      const nameMap = buildCategoryNameMap(categories);
      const food = mapMenuItemToFood(item, nameMap.get(item.categoryId) ?? "");
      const similar = items
        .filter((i) => i._id !== id && i.categoryId === item.categoryId)
        .slice(0, 4)
        .map((i) => mapMenuItemToFood(i, nameMap.get(i.categoryId) ?? ""));
      return { food, similar };
    },
  });
}

function useFoodRatings(id: string) {
  return useQuery({
    queryKey: ["food-ratings", id],
    queryFn: () => getMenuItemRatings(id),
  });
}

function FoodDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useFoodDetail(id);
  const { data: ratings } = useFoodRatings(id);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return <div className="px-6 py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (isError || !data) {
    return (
      <div className="px-6 py-20 text-center">
        <div className="text-5xl mb-3">🍽️</div>
        <h1 className="text-2xl font-bold">Dish not found</h1>
        <Link to="/menu" className="text-primary font-medium mt-4 inline-block hover:underline">
          Browse menu →
        </Link>
      </div>
    );
  }

  const { food, similar } = data;

  const handleAddToCart = () => {
    addItem(
      {
        menuItemId: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        veg: food.veg,
        customizations: [],
      },
      qty,
    );
    toast.success(`${food.name} added to cart`);
  };

  return (
    <div className="px-4 md:px-6 py-5 max-w-[1200px] mx-auto animate-fade-in">
      <Link
        to="/menu"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back to menu
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-2xl overflow-hidden border bg-muted"
          >
            <img
              src={food.image}
              alt={food.name}
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <button
                key={i}
                className="aspect-square rounded-lg overflow-hidden border hover:border-primary transition"
              >
                <img src={food.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold ${food.veg ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${food.veg ? "bg-success" : "bg-destructive"}`}
              />
              {food.veg ? "Veg" : "Non-Veg"}
            </span>
            {food.bestseller && (
              <span className="bg-primary text-primary-foreground font-bold uppercase px-2 py-1 rounded">
                Bestseller
              </span>
            )}
            <span className="text-muted-foreground">in {food.category}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{food.name}</h1>

          {food.rating && (
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 bg-success/10 text-success font-bold px-2 py-1 rounded">
                <Star className="w-3.5 h-3.5 fill-current" />
                {food.rating}
              </span>
              <span className="text-muted-foreground">({food.reviewCount} reviews)</span>
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 25–30 min
              </span>
            </div>
          )}

          <p className="text-muted-foreground leading-relaxed">{food.longDesc ?? food.desc}</p>

          {food.ingredients && (
            <div>
              <h3 className="font-semibold mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {food.ingredients.map((ing: string) => (
                  <span key={ing} className="text-xs px-3 py-1.5 bg-muted rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { I: Leaf, t: "Fresh", d: "Made to order" },
              { I: Flame, t: "Hygienic", d: "FSSAI certified" },
              { I: Clock, t: "On-time", d: "Live tracking" },
            ].map(({ I, t, d }) => (
              <div key={t} className="flex items-center gap-2 p-3 bg-muted/60 rounded-lg">
                <I className="w-4 h-4 text-primary shrink-0" />
                <div className="leading-tight">
                  <div className="font-semibold">{t}</div>
                  <div className="text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky cart bar */}
          <div className="border-t pt-5 flex items-center gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Price</div>
              <div className="text-3xl font-extrabold">₹{food.price * qty}</div>
            </div>

            <div className="ml-auto flex items-center border rounded-full overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 grid place-items-center hover:bg-muted"
                aria-label="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 grid place-items-center hover:bg-muted"
                aria-label="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={() => setFav(!fav)}
              className="rounded-full w-11 h-11"
              aria-label="Favourite"
            >
              <Heart className={`w-4 h-4 ${fav ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              size="lg"
              className="rounded-full h-11 px-6 gap-2 shadow-pop"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Similar items */}
      {similar.length > 0 && (
        <section className="mt-14 space-y-4">
          <h2 className="text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-14 space-y-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {!ratings || ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reviews yet — be the first to rate this dish after your order is delivered.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {ratings.map((r) => {
              const name =
                typeof r.passengerId === "string" ? "Verified Traveler" : r.passengerId.name;
              return (
                <div key={r._id} className="border rounded-2xl p-5 bg-card">
                  <div className="flex gap-0.5 text-primary mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.rating ? "fill-current" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  {r.reviewText && <p className="text-sm">"{r.reviewText}"</p>}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold grid place-items-center">
                      {name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-xs text-muted-foreground">Verified Traveler</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
