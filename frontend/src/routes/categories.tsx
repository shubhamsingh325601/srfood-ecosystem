import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMenu } from "@/features/menu/services/menuApi";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: `Categories – ${APP_NAME}` }] }),
  component: CategoriesPage,
});

function useCategoriesWithCounts() {
  return useQuery({
    queryKey: ["categories-with-counts"],
    queryFn: async () => {
      const { categories, items } = await getMenu();
      return categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
        count: items.filter((i) => i.categoryId === c._id).length,
        sampleImageUrl: items.find((i) => i.categoryId === c._id)?.imageUrl ?? c.imageUrl,
      }));
    },
  });
}

function CategoriesPage() {
  const { data, isLoading } = useCategoriesWithCounts();
  const categories = data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold mb-5">All Categories</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/menu"
              search={{ category: c.slug }}
              className="bg-card border rounded-2xl p-4 hover:shadow-card hover:border-primary/30 transition group"
            >
              {c.sampleImageUrl && (
                <img
                  src={c.sampleImageUrl}
                  alt={c.name}
                  className="w-full aspect-square object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition"
                />
              )}
              <h3 className="font-bold">{c.name}</h3>
              <p className="text-xs text-muted-foreground">{c.count} items</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
