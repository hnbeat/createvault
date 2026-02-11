import { getAllReferences, getTopVotedReferences, searchReferences, getAllCategories, getTeamFavorites } from "@/db/queries";
import { ReferenceGrid } from "@/components/ui/ReferenceGrid";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { TeamFavorites } from "@/components/ui/TeamFavorites";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ search?: string; view?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.search;
  const view = (params.view === "list" ? "list" : "grid") as "grid" | "list";

  const [topVoted, refs, categories, teamFavs] = await Promise.all([
    query ? Promise.resolve([]) : getTopVotedReferences(10),
    query ? searchReferences(query) : getAllReferences(),
    getAllCategories(),
    query ? Promise.resolve([]) : getTeamFavorites(),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero Banner — only on homepage without search */}
      {!query && <HeroBanner categories={categories} />}

      {/* Team Favorites — only on homepage without search */}
      {!query && teamFavs.length > 0 && (
        <TeamFavorites collections={teamFavs} />
      )}

      {/* Search results header */}
      {query && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Search results for &ldquo;{query}&rdquo;
            </h1>
            <p className="mt-1 text-sm text-white/50">
              {refs.length} reference{refs.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Suspense fallback={null}>
            <ViewToggle />
          </Suspense>
        </div>
      )}

      {/* View toggle row for non-search */}
      {!query && (
        <div className="flex items-center justify-end">
          <Suspense fallback={null}>
            <ViewToggle />
          </Suspense>
        </div>
      )}

      {/* Featured — based on most upvoted */}
      {!query && topVoted.length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold uppercase tracking-widest text-white mb-5">
            Featured
          </h2>
          <ReferenceGrid references={topVoted} view={view} />
        </section>
      )}

      {/* Latest Additions */}
      <section>
        {!query && (
          <h2 className="text-3xl font-semibold uppercase tracking-widest text-white mb-5">
            Latest Additions
          </h2>
        )}
        <ReferenceGrid
          references={refs}
          view={view}
          emptyMessage={
            query
              ? `No references matching "${query}"`
              : "No references yet — add your first one!"
          }
        />
      </section>
    </div>
  );
}
