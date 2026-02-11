"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category, Collection } from "@/db/schema";

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});

    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data))
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 px-3">
            Categories
          </h3>
          <nav className="space-y-0.5">
            {categories.map((cat) => {
              const isActive = pathname === `/categories/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-neutral-800 text-white font-medium"
                      : "text-white/70 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 px-3">
              Collections
            </h3>
            <nav className="space-y-0.5">
              {collections.map((col) => {
                const isActive = pathname === `/collections/${col.slug}`;
                return (
                  <Link
                    key={col.id}
                    href={`/collections/${col.slug}`}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-neutral-800 text-white font-medium"
                        : "text-white/70 hover:bg-neutral-800/50 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{col.icon ?? "📁"}</span>
                    <span className="truncate">{col.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Quick Add */}
        <div className="px-3">
          <Link
            href="/submit"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black shadow-sm hover:bg-neutral-200 transition-colors"
          >
            <span>➕</span>
            Add Reference
          </Link>
        </div>
      </div>
    </aside>
  );
}
