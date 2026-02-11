"use client";

import { getDomainFromUrl, getFaviconUrl, getDomainGradient, categoryColors } from "@/lib/utils";
import { TagBadge } from "./TagBadge";
import { VoteButtons } from "./VoteButtons";
import { useEffect, useState } from "react";

interface ReferenceCardProps {
  id: number;
  title: string;
  url: string;
  description: string | null;
  thumbnail: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  isBookmarked: boolean | null;
  votes: number;
  createdAt: string;
}

export function ReferenceCard({
  id,
  title,
  url,
  description,
  thumbnail,
  categoryName,
  categorySlug,
  categoryIcon,
  categoryColor,
  isBookmarked,
  votes,
  createdAt,
}: ReferenceCardProps) {
  const [tags, setTags] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [bookmarked, setBookmarked] = useState(!!isBookmarked);
  const [bookmarking, setBookmarking] = useState(false);
  const domain = getDomainFromUrl(url);
  const favicon = getFaviconUrl(url);

  const handleBookmark = async () => {
    if (bookmarking) return;
    setBookmarking(true);
    setBookmarked((prev) => !prev);

    try {
      const res = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          setBookmarked(!!data[0].isBookmarked);
        }
      } else {
        setBookmarked((prev) => !prev);
      }
    } catch {
      setBookmarked((prev) => !prev);
    } finally {
      setBookmarking(false);
    }
  };

  useEffect(() => {
    fetch(`/api/references?tags=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTags(data);
      })
      .catch(() => {});
  }, [id]);

  return (
    <div className="group relative flex flex-col overflow-hidden border border-bd bg-neutral-950">
      {/* Bookmark star — top right */}
      <button
        onClick={handleBookmark}
        disabled={bookmarking}
        className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 transition-all duration-200 disabled:opacity-40"
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        {bookmarked ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 hover:opacity-100 transition-opacity">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}
      </button>

      {/* Thumbnail / Preview */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[16/10] overflow-hidden bg-neutral-900"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-[2px]"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-3 transition-all duration-300 group-hover:blur-[2px]"
            style={{
              background: `linear-gradient(135deg, ${getDomainGradient(domain).from}, ${getDomainGradient(domain).to})`,
            }}
          >
            {/* Decorative grid dots */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />
            {/* Favicon */}
            <img
              src={favicon}
              alt=""
              className="h-10 w-10 opacity-70 relative z-[1]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Domain label */}
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium relative z-[1]">
              {domain}
            </span>
          </div>
        )}
        {/* Hover overlay with Visit button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <span className="border border-white bg-white/10 backdrop-blur-sm px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Visit Site ↗
          </span>
        </div>
      </a>

      {/* Content — separated from image by border */}
      <div className="flex flex-1 flex-col border-t border-bd px-4 pt-4 pb-3">
        {/* Title */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white leading-snug line-clamp-2 hover:text-white/80 transition-colors"
        >
          {title}
        </a>

        {/* Description */}
        {description && (
          <p className="mt-1 text-sm text-white/50 line-clamp-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Tags + Votes — separated by thin line */}
      <div className="flex items-center justify-between border-t border-bd px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {categoryName && (
            <a href={`/categories/${categorySlug}`}>
              <TagBadge name={categoryName} />
            </a>
          )}
          {tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} />
          ))}
        </div>
        <VoteButtons referenceId={id} initialVotes={votes} />
      </div>
    </div>
  );
}
