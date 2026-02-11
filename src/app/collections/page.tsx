import { getAllCollections } from "@/db/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Collections</h1>
        <p className="mt-1 text-sm text-white/50">
          Curated lists of references for specific use cases
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-white mb-1">
            No collections yet
          </h3>
          <p className="text-sm text-white/50">
            Collections are curated sets of references — coming soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group flex flex-col rounded-2xl border border-bd bg-neutral-900 p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-black/20 hover:border-bd hover:-translate-y-0.5"
            >
              <div className="text-3xl mb-3">{col.icon ?? "📁"}</div>
              <h3 className="font-semibold text-white group-hover:text-white/80 transition-colors">
                {col.name}
              </h3>
              {col.description && (
                <p className="mt-1.5 text-sm text-white/50 line-clamp-2">
                  {col.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
