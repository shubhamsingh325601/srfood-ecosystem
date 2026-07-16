import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  isFavorite: (menuItemId: string) => boolean;
  toggleFavorite: (menuItemId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      isFavorite: (menuItemId) => get().ids.includes(menuItemId),
      toggleFavorite: (menuItemId) =>
        set((state) => ({
          ids: state.ids.includes(menuItemId)
            ? state.ids.filter((id) => id !== menuItemId)
            : [...state.ids, menuItemId],
        })),
    }),
    { name: "srfood_favorites_v1" },
  ),
);
