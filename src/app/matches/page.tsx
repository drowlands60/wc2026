import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import fixturesData from "@/data/fixtures.json";

const FALLBACK_MATCHES = fixturesData.matches.map((m) => ({
  id: m.id,
  match_date: m.utcDate,
  stage: m.stage,
  group_name: m.group?.replace("GROUP_", "") ?? null,
  status: "SCHEDULED",
  home_score: m.score?.fullTime?.home ?? null,
  away_score: m.score?.fullTime?.away ?? null,
  home_team: m.homeTeam?.tla ? { name: m.homeTeam.name, code: m.homeTeam.tla } : null,
  away_team: m.awayTeam?.tla ? { name: m.awayTeam.name, code: m.awayTeam.tla } : null,
}));

export default async function MatchesPage() {
  let matches: any[] = FALLBACK_MATCHES;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        stage,
        group_name,
        status,
        home_score,
        away_score,
        home_team:teams!matches_home_team_id_fkey(name, code),
        away_team:teams!matches_away_team_id_fkey(name, code)
      `)
      .order("match_date", { ascending: true }) as any;
    if (data?.length) matches = data;
  }

  const grouped = (matches ?? []).reduce(
    (acc: Record<string, any[]>, match: any) => {
      const date = new Date(match.match_date);
      const key = date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!acc[key]) acc[key] = [];
      acc[key].push(match);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Match Results</h1>
        <Link href="/resources/form-guide" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          Form guide →
        </Link>
      </div>
      <p className="text-gray-400 mb-8">Full schedule and results</p>

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 bg-[#1e2d3d] rounded-xl border border-gray-700/50">
          <p className="text-gray-400 text-lg">No matches loaded yet.</p>
        </div>
      )}

      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div key={stage} className="mb-8">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">{stage}</h2>
          <div className="space-y-2">
            {(stageMatches as any[]).map((match: any) => {
              const matchDate = new Date(match.match_date);
              return (
                <div key={match.id} className="bg-[#1e2d3d] rounded-lg border border-gray-700/50 p-4 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {matchDate.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {match.status === "FINISHED" && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">FT</span>
                    )}
                    {match.status === "LIVE" && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded animate-pulse font-mono">LIVE</span>
                    )}
                    {match.status === "SCHEDULED" && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Upcoming</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="flex-1 text-right font-medium text-gray-100">
                      {(match.home_team as any)?.name ?? "TBD"}
                    </span>
                    <span className="font-bold text-lg min-w-[60px] text-center text-white">
                      {match.status === "FINISHED" || match.status === "LIVE"
                        ? `${match.home_score} - ${match.away_score}`
                        : "vs"}
                    </span>
                    <span className="flex-1 text-left font-medium text-gray-100">
                      {(match.away_team as any)?.name ?? "TBD"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/resources/fifa-results" className="text-gray-500 hover:text-emerald-400 transition-colors">
          View historical results
        </Link>
        <Link href="/resources/group-analysis" className="text-gray-500 hover:text-emerald-400 transition-colors">
          Group stage analysis
        </Link>
      </div>
    </div>
  );
}
