"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";

interface Match {
  id: number;
  match_date: string;
  stage: string;
  group_name: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: number; name: string; code: string } | null;
  away_team: { id: number; name: string; code: string } | null;
}

interface Prediction {
  id: number;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number | null;
}

export function PredictionForm({
  match,
  prediction,
  isLocked,
}: {
  match: Match;
  prediction: Prediction | undefined;
  isLocked: boolean;
}) {
  const [homeScore, setHomeScore] = useState<string>(
    prediction?.home_score?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState<string>(
    prediction?.away_score?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scotlandWarning, setScotlandWarning] = useState(false);
  const supabase = createClient();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const matchDate = new Date(match.match_date);
  const formattedDate = matchDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    if (isLocked) return;
    if (homeScore === "" || awayScore === "") return;

    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a)) return;

    // Check if Scotland is predicted to win
    const scotlandIsHome = match.home_team?.code === "SCO" || match.home_team?.name === "Scotland";
    const scotlandIsAway = match.away_team?.code === "SCO" || match.away_team?.name === "Scotland";
    if ((scotlandIsHome && h > a) || (scotlandIsAway && a > h)) {
      setScotlandWarning(true);
      return;
    }

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      handleSave();
    }, 800);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [homeScore, awayScore]);

  async function handleSave() {
    if (homeScore === "" || awayScore === "") return;
    setSaving(true);

    const { error } = await supabase.from("predictions").upsert(
      {
        match_id: match.id,
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        user_id: (await supabase.auth.getUser()).data.user!.id,
      },
      { onConflict: "user_id,match_id" }
    );

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function getPointsBadge() {
    if (prediction?.points === null || prediction?.points === undefined) return null;
    const colors: Record<number, string> = {
      3: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
      2: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
      1: "bg-orange-500/20 text-orange-300 border-orange-500/50",
      0: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colors[prediction.points] ?? colors[0]}`}>
        {prediction.points}pts
      </span>
    );
  }

  const hasPrediction = homeScore !== "" && awayScore !== "";

  function getTileColor() {
    if (match.status === "FINISHED" && prediction?.points !== null && prediction?.points !== undefined) {
      const pointsColors: Record<number, string> = {
        3: "bg-yellow-500/10 border-yellow-500/40",
        2: "bg-cyan-500/10 border-cyan-500/30",
        1: "bg-orange-500/10 border-orange-500/30",
        0: "bg-red-500/10 border-red-500/20",
      };
      return pointsColors[prediction.points] ?? "bg-[#1e2d3d]";
    }
    if (hasPrediction) return "bg-emerald-500/10 border-emerald-500/30";
    return "bg-[#1e2d3d] border-gray-700/50";
  }

  return (
    <div className={`rounded-lg shadow-lg border p-4 ${isLocked ? "opacity-60" : "hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all"} ${getTileColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{formattedDate}</span>
        <div className="flex items-center gap-2">
          {getPointsBadge()}
          {match.status === "FINISHED" && (
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">FT</span>
          )}
          {match.status === "LIVE" && (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded animate-pulse font-mono">LIVE</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex-1 text-right">
          <span className="font-medium text-gray-100">
            {match.home_team?.name ?? "TBD"}
          </span>
          {match.status === "FINISHED" && (
            <span className="ml-2 font-bold text-lg text-white">{match.home_score}</span>
          )}
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={isLocked}
            className={`w-12 h-10 text-center text-lg font-bold border-2 rounded-lg bg-[#0f1923] text-white focus:border-emerald-400 focus:outline-none focus:shadow-[0_0_10px_rgba(0,230,118,0.3)] disabled:bg-gray-800 disabled:text-gray-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              saving ? "border-yellow-400" : saved ? "border-emerald-400" : "border-gray-600"
            }`}
            placeholder="-"
          />
          <span className="text-gray-500 font-bold">:</span>
          <input
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={isLocked}
            className={`w-12 h-10 text-center text-lg font-bold border-2 rounded-lg bg-[#0f1923] text-white focus:border-emerald-400 focus:outline-none focus:shadow-[0_0_10px_rgba(0,230,118,0.3)] disabled:bg-gray-800 disabled:text-gray-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              saving ? "border-yellow-400" : saved ? "border-emerald-400" : "border-gray-600"
            }`}
            placeholder="-"
          />
          {!isLocked && saved && (
            <span className="ml-1 text-xs text-emerald-400">✓</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1">
          <span className="font-medium text-gray-100">
            {match.away_team?.name ?? "TBD"}
          </span>
          {match.status === "FINISHED" && (
            <span className="ml-2 font-bold text-lg text-white">{match.away_score}</span>
          )}
        </div>
      </div>

      {scotlandWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a2634] border border-yellow-500/30 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.15)] max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
              <h3 className="text-lg font-bold text-yellow-300 mb-3">You predicted Scotland to win, are you sure?</h3>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setScotlandWarning(false);
                    if (saveTimeout.current) clearTimeout(saveTimeout.current);
                    saveTimeout.current = setTimeout(() => handleSave(), 800);
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
                >
                  Yes, I believe
                </button>
                <button
                  onClick={() => {
                    setScotlandWarning(false);
                    setHomeScore("");
                    setAwayScore("");
                  }}
                  className="px-5 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Come to my senses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
