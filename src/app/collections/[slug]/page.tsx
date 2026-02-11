import { getCollectionReferences } from "@/db/queries";
import { ReferenceGrid } from "@/components/ui/ReferenceGrid";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const { collection, refs } = await getCollectionReferences(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/40">
        <Link href="/collections" className="hover:text-white transition-colors">
          Collections
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{collection.name}</span>
      </nav>

      {/* Header */}
      <div>
        <div className="text-3xl mb-2">{collection.icon ?? "📁"}</div>
        <h1 className="text-2xl font-bold text-white">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-1 text-sm text-white/60">
            {collection.description}
          </p>
        )}
        <p className="mt-1 text-xs text-white/40">
          {refs.length} reference{refs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* References */}
      <ReferenceGrid
        references={refs}
        emptyMessage={`No references in this collection yet`}
      />
    </div>
  );
}
