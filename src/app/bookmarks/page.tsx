import { getBookmarkedReferences } from "@/db/queries";
import { ReferenceGrid } from "@/components/ui/ReferenceGrid";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const refs = await getBookmarkedReferences();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>⭐</span> Bookmarks
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Your saved references for quick access
        </p>
      </div>

      <ReferenceGrid
        references={refs}
        emptyMessage="No bookmarked references yet — star some to save them here!"
      />
    </div>
  );
}
