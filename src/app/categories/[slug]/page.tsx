import { getCategoryBySlug, getReferencesByCategory } from "@/db/queries";
import { ReferenceGrid } from "@/components/ui/ReferenceGrid";
import { categoryColors } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const refs = await getReferencesByCategory(slug);
  const colors = categoryColors[category.color ?? "blue"] ?? categoryColors.blue;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/40">
        <Link href="/categories" className="hover:text-white transition-colors">
          Categories
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-2xl text-2xl ${colors}`}
        >
          {category.icon ?? "📁"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-1 text-sm text-white/60">
              {category.description}
            </p>
          )}
          <p className="mt-1 text-xs text-white/40">
            {refs.length} reference{refs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* References */}
      <ReferenceGrid
        references={refs}
        emptyMessage={`No references in ${category.name} yet`}
      />
    </div>
  );
}
