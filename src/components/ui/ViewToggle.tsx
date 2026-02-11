"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") ?? "grid";

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "grid") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  };

  return (
    <div className="flex items-center border border-bd">
      {/* Grid view */}
      <button
        onClick={() => setView("grid")}
        className={`flex items-center justify-center w-9 h-9 transition-colors ${
          currentView === "grid"
            ? "bg-white text-black"
            : "text-white/40 hover:text-white hover:bg-neutral-800"
        }`}
        title="Card view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="6" height="6" />
          <rect x="9" y="1" width="6" height="6" />
          <rect x="1" y="9" width="6" height="6" />
          <rect x="9" y="9" width="6" height="6" />
        </svg>
      </button>

      {/* List view */}
      <button
        onClick={() => setView("list")}
        className={`flex items-center justify-center w-9 h-9 border-l border-bd transition-colors ${
          currentView === "list"
            ? "bg-white text-black"
            : "text-white/40 hover:text-white hover:bg-neutral-800"
        }`}
        title="List view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="2" x2="15" y2="2" />
          <line x1="1" y1="6" x2="15" y2="6" />
          <line x1="1" y1="10" x2="15" y2="10" />
          <line x1="1" y1="14" x2="15" y2="14" />
        </svg>
      </button>
    </div>
  );
}
