import { Heart, Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import type { Food } from "@/data/foods";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export type { Food };

export function FoodCard({ food }: { food: Food }) {
  const [fav, setFav] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      menuItemId: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      veg: food.veg,
      customizations: [],
    });
    toast.success(`${food.name} added to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border rounded-2xl overflow-hidden hover:shadow-card transition group flex flex-col"
    >
      <Link to="/food/$id" params={{ id: food.id }} className="relative block">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          width={512}
          height={512}
          className="w-full aspect-square object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        {food.bestseller && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-1 rounded">
            Bestseller
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            setFav(!fav);
          }}
          className="absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full bg-background/90 backdrop-blur hover:scale-110 transition"
          aria-label="Favourite"
        >
          <Heart className={`w-4 h-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </Link>
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="flex items-start gap-2">
          <span
            className={`mt-1 w-3.5 h-3.5 border-2 grid place-items-center shrink-0 ${food.veg ? "border-success" : "border-destructive"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${food.veg ? "bg-success" : "bg-destructive"}`}
            />
          </span>
          <Link
            to="/food/$id"
            params={{ id: food.id }}
            className="font-semibold text-sm leading-tight flex-1 hover:text-primary transition"
          >
            {food.name}
          </Link>
          {food.rating && (
            <span className="flex items-center gap-0.5 text-xs font-semibold bg-success/10 text-success px-1.5 py-0.5 rounded">
              <Star className="w-3 h-3 fill-current" />
              {food.rating}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{food.desc}</p>
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="font-bold">₹{food.price}</span>
          <Button
            size="sm"
            className="rounded-md h-8 gap-1 px-3 text-xs font-bold"
            onClick={handleAddToCart}
          >
            Add <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
