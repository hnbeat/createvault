import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  color: string | null;
  count?: number;
}

export function CategoryCard({
  name,
  slug,
  description,
  count,
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group flex flex-col border border-bd bg-neutral-950 transition-all hover:bg-white"
    >
      {/* Top section */}
      <div className="flex items-center justify-between border-b border-bd px-5 py-4">
        <h3 className="text-2xl font-semibold uppercase tracking-widest text-white group-hover:text-black transition-colors">
          {name}
        </h3>
        {count !== undefined && (
          <span className="text-xs font-medium text-white/40 group-hover:text-black/40 transition-colors">
            {count}
          </span>
        )}
      </div>
      {/* Description */}
      {description && (
        <div className="px-5 py-4">
          <p className="text-sm text-white/50 group-hover:text-black/50 line-clamp-2 leading-relaxed transition-colors">
            {description}
          </p>
        </div>
      )}
    </Link>
  );
}
