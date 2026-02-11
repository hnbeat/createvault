import { ReferenceCard } from "./ReferenceCard";
import { ReferenceListItem } from "./ReferenceListItem";

interface ReferenceData {
  id: number;
  title: string;
  url: string;
  description: string | null;
  thumbnail: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  isFeatured: boolean | null;
  isBookmarked: boolean | null;
  votes: number;
  createdAt: string;
}

interface ReferenceGridProps {
  references: ReferenceData[];
  emptyMessage?: string;
  view?: "grid" | "list";
}

export function ReferenceGrid({
  references,
  emptyMessage = "No references found",
  view = "grid",
}: ReferenceGridProps) {
  if (references.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-white mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-white/50">
          Try a different search or add some references!
        </p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="border border-bd">
        {references.map((ref, i) => (
          <ReferenceListItem
            key={ref.id}
            id={ref.id}
            title={ref.title}
            url={ref.url}
            description={ref.description}
            thumbnail={ref.thumbnail}
            categoryName={ref.categoryName}
            categorySlug={ref.categorySlug}
            votes={ref.votes}
            showBorder={i !== 0}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {references.map((ref) => (
        <ReferenceCard
          key={ref.id}
          id={ref.id}
          title={ref.title}
          url={ref.url}
          description={ref.description}
          thumbnail={ref.thumbnail}
          categoryName={ref.categoryName}
          categorySlug={ref.categorySlug}
          categoryIcon={ref.categoryIcon}
          categoryColor={ref.categoryColor}
          isBookmarked={ref.isBookmarked}
          votes={ref.votes}
          createdAt={ref.createdAt}
        />
      ))}
    </div>
  );
}
