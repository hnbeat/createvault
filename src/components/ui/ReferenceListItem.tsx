"use client";

import { getDomainFromUrl, getFaviconUrl, getDomainGradient } from "@/lib/utils";
import { TagBadge } from "./TagBadge";
import { VoteButtons } from "./VoteButtons";
import { useEffect, useState } from "react";

interface ReferenceListItemProps {
  id: number;
  title: string;
  url: string;
  description: string | null;
  thumbnail: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  votes: number;
  showBorder?: boolean;
}

export function ReferenceListItem({
  id,
  title,
  url,
  description,
  thumbnail,
  categoryName,
  categorySlug,
  votes,
  showBorder = true,
}: ReferenceListItemProps) {
  const [tags, setTags] = useState<{ id: number; name: string; slug: string }[]>([]);
  const domain = getDomainFromUrl(url);
  const favicon = getFaviconUrl(url);

  useEffect(() => {
    fetch(`/api/references?tags=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTags(data);
      })
      .catch(() => {});
  }, [id]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-4 px-4 py-3 bg-neutral-950 hover:bg-neutral-900 transition-colors ${
        showBorder ? "border-t border-bd" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-11 overflow-hidden bg-neutral-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="relative flex w-full h-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${getDomainGradient(domain).from}, ${getDomainGradient(domain).to})`,
            }}
          >
            <img
              src={favicon}
              alt=""
              className="h-5 w-5 opacity-70"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate group-hover:text-white/80 transition-colors">
            {title}
          </span>
          <span className="text-xs text-white/30 shrink-0">{domain}</span>
        </div>
        {description && (
          <p className="text-sm text-white/40 truncate mt-0.5">{description}</p>
        )}
      </div>

      {/* Tags */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {categoryName && (
          <TagBadge name={categoryName} />
        )}
        {tags.slice(0, 2).map((tag) => (
          <TagBadge key={tag.id} name={tag.name} />
        ))}
      </div>

      {/* Votes */}
      <div className="shrink-0">
        <VoteButtons referenceId={id} initialVotes={votes} />
      </div>
    </a>
  );
}
