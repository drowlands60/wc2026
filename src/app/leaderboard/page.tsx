import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  matches_scored: number;
  exact_scores: number;
  correct_differences: number;
  correct_results: number;
  total_predictions: number;
}

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { user_id: "1", display_name: "FootballFan99", avatar_url: null, total_points: 14, matches_scored: 6, exact_scores: 2, correct_differences: 2, correct_results: 2, total_predictions: 6 },
  { user_id: "2", display_name: "PredictionKing", avatar_url: null, total_points: 11, matches_scored: 6, exact_scores: 1, correct_differences: 2, correct_results: 3, total_predictions: 6 },
  { user_id: "3", display_name: "GoalGuesser", avatar_url: null, total_points: 9, matches_scored: 6, exact_scores: 1, correct_differences: 1, correct_results: 3, total_predictions: 6 },
  { user_id: "4", display_name: "WorldCupWizard", avatar_url: null, total_points: 7, matches_scored: 6, exact_scores: 0, correct_differences: 2, correct_results: 3, total_predictions: 6 },
  { user_id: "5", display_name: "LuckyStriker", avatar_url: null, total_points: 5, matches_scored: 6, exact_scores: 0, correct_differences: 1, correct_results: 3, total_predictions: 6 },
];

export default async function LeaderboardPage() {
  let leaderboard: LeaderboardEntry[] = DEMO_LEADERBOARD;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data } = await supabase.from("leaderboard").select("*");
    if (data && data.length > 0) leaderboard = data;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <Link href="/resources/head-to-head" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          View full scoring breakdown →
        </Link>
      </div>
      <p className="text-gray-400 mb-8">See who&apos;s leading the prediction league</p>

      {(!leaderboard || leaderboard.length === 0) ? (
        <div className="text-center py-12 bg-[#1e2d3d] rounded-xl border border-gray-700/50">
          <p className="text-gray-400 text-lg">No scores yet.</p>
          <p className="text-gray-500 mt-2">The leaderboard will update once matches finish.</p>
        </div>
      ) : (
        <div className="bg-[#1e2d3d] rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0a1628] border-b border-emerald-500/20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Player</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Pts</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300 hidden sm:table-cell">Exact</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300 hidden sm:table-cell">GD</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300 hidden sm:table-cell">Result</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300 hidden sm:table-cell">Played</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                // Compute rank with ties: first person gets number, ties show "="
                const rank = index === 0 ? 1 :
                  leaderboard[index - 1].total_points === entry.total_points
                    ? leaderboard.findIndex(e => e.total_points === entry.total_points) + 1
                    : index + 1;
                const isTied = index > 0 && leaderboard[index - 1].total_points === entry.total_points;
                const displayRank = isTied ? "=" : rank;

                return (
                <tr
                  key={entry.user_id}
                  className={`border-b border-gray-700/30 last:border-0 ${
                    rank <= 3 ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      rank === 1 ? "text-yellow-400 text-lg" :
                      rank === 2 ? "text-gray-300 text-lg" :
                      rank === 3 ? "text-amber-500 text-lg" :
                      "text-gray-500"
                    }`}>
                      {displayRank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-100">
                    <a href="https://archive.is/NJY8F" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors underline decoration-gray-600 hover:decoration-emerald-400">
                      {entry.display_name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-emerald-400 text-lg">
                      {entry.total_points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-400 hidden sm:table-cell">
                    {entry.exact_scores}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-400 hidden sm:table-cell">
                    {entry.correct_differences}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-400 hidden sm:table-cell">
                    {entry.correct_results}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-400 hidden sm:table-cell">
                    {entry.matches_scored}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/resources/match-stats" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">
          How are points calculated?
        </Link>
      </div>
    </div>
  );
}
