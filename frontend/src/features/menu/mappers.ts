import type { Food } from "@/data/foods";
import type { ApiCategory, ApiMenuItem } from "./types";

/** Converts the API's integer-paise price to the plain-rupee numbers the existing UI already does arithmetic on (CLAUDE.md §7). */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

export function mapMenuItemToFood(item: ApiMenuItem, categoryName: string): Food {
  return {
    id: item._id,
    name: item.name,
    desc: item.shortDescription ?? "",
    longDesc: item.description,
    price: paiseToRupees(item.price),
    image: item.imageUrl ?? "",
    veg: item.isVeg,
    category: categoryName,
    bestseller: item.isBestseller,
    rating: item.avgRating || undefined,
    reviewCount: item.ratingCount || undefined,
    ingredients: item.ingredients,
  };
}

export function buildCategoryNameMap(categories: ApiCategory[]): Map<string, string> {
  return new Map(categories.map((c) => [c._id, c.name]));
}
