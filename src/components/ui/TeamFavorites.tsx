import Link from "next/link";

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

interface TeamFavoritesProps {
  collections: Collection[];
}

const memberColors: Record<string, string> = {
  J: "from-violet-500/20 to-violet-900/10 border-violet-500/30 hover:border-violet-400/60",
  B: "from-blue-500/20 to-blue-900/10 border-blue-500/30 hover:border-blue-400/60",
  H: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-400/60",
};

const memberAccent: Record<string, string> = {
  J: "bg-violet-500",
  B: "bg-blue-500",
  H: "bg-emerald-500",
};

export function TeamFavorites({ collections }: TeamFavoritesProps) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">
        Team Favorites
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const initial = col.icon ?? col.name.charAt(0);
          const colorClass = memberColors[initial] ?? "from-white/10 to-white/5 border-bd hover:border-white/40";
          const accentClass = memberAccent[initial] ?? "bg-white/40";

          // Extract the person's name from "Name's Favorites"
          const displayName = col.name.replace("'s Favorites", "");

          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className={`group relative flex flex-col justify-between border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 ${colorClass}`}
              style={{ minHeight: "160px" }}
            >
              {/* Initial badge */}
              <div className={`flex h-10 w-10 items-center justify-center text-sm font-bold text-white ${accentClass}`}>
                {initial}
              </div>

              {/* Content */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
                  {displayName}&apos;s Favorites
                </h3>
                {col.description && (
                  <p className="mt-1 text-sm text-white/40 line-clamp-2">
                    {col.description}
                  </p>
                )}
              </div>

              {/* Arrow indicator */}
              <div className="absolute top-6 right-6 text-white/20 group-hover:text-white/60 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
