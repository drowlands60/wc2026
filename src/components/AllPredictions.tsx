"use client";

import { useState } from "react";

interface UserPrediction {
  display_name: string;
  home_score: number;
  away_score: number;
  points: number | null;
}

export function AllPredictions({
  predictions,
  homeTeam,
  awayTeam,
}: {
  predictions: UserPrediction[];
  homeTeam: string;
  awayTeam: string;
}) {
  const [open, setOpen] = useState(false);

  if (!predictions.length) return null;

  return (
    <div className="mt-3 border-t border-gray-700/50 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors w-full"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>All predictions ({predictions.length})</span>
      </button>

      {open && (
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-xs text-gray-500 px-2 pb-1 border-b border-gray-700/30">
            <span>Player</span>
            <span className="text-right">{homeTeam}</span>
            <span></span>
            <span>{awayTeam}</span>
          </div>
          {predictions.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center text-sm px-2 py-1 rounded hover:bg-gray-700/20"
            >
              <span className="text-gray-300 truncate">{p.display_name}</span>
              <span className="text-white font-mono text-right w-4">{p.home_score}</span>
              <span className="text-gray-500 font-mono">-</span>
              <span className="text-white font-mono w-4">{p.away_score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
