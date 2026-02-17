"use client";

import { useState } from "react";

interface VoteButtonsProps {
  referenceId: number;
  initialVotes: number;
}

export function VoteButtons({ referenceId, initialVotes }: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voting, setVoting] = useState(false);

  const handleVote = async (direction: "up" | "down") => {
    if (voting) return;
    setVoting(true);

    // Optimistic update
    setVotes((prev) => prev + (direction === "up" ? 1 : -1));

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId, direction }),
      });
      const data = await res.json();
      if (res.ok) {
        setVotes(data.votes);
      } else {
        // Revert optimistic update
        setVotes((prev) => prev + (direction === "up" ? -1 : 1));
      }
    } catch {
      // Revert optimistic update
      setVotes((prev) => prev + (direction === "up" ? -1 : 1));
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Upvote */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("up");
        }}
        disabled={voting}
        className="flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-green-400 hover:bg-white/5 transition-colors disabled:opacity-40"
        title="Upvote"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>

      {/* Vote count */}
      <span className={`text-xs tabular-nums min-w-[20px] text-center font-medium ${
        votes > 0 ? "text-green-400" : votes < 0 ? "text-red-400" : "text-white/30"
      }`}>
        {votes}
      </span>

      {/* Downvote */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("down");
        }}
        disabled={voting}
        className="flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-40"
        title="Downvote"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15V19a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </button>
    </div>
  );
}
