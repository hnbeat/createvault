import { getAllCategories, getReferencesByCategory } from "@/db/queries";
import { CategoryCard } from "@/components/ui/CategoryCard";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const refs = await getReferencesByCategory(cat.slug);
      return { ...cat, count: refs.length };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="mt-1 text-sm text-white/50">
          Browse references organized by category
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {categoriesWithCounts.map((cat) => (
          <CategoryCard
            key={cat.id}
            name={cat.name}
            slug={cat.slug}
            icon={cat.icon}
            description={cat.description}
            color={cat.color}
            count={cat.count}
          />
        ))}
      </div>
    </div>
  );
}
