import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import fixturesData from "@/data/fixtures.json";
import { GroupToggle } from "@/components/GroupToggle";

interface Team {
  name: string;
  code: string;
  flag_url?: string;
}

interface Match {
  id: string | number;
  match_date: string;
  stage: string;
  group_name: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: Team | null;
  away_team: Team | null;
}

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Group Stage",
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-Finals",
  SEMI_FINALS: "Semi-Finals",
  THIRD_PLACE: "Third Place",
  FINAL: "Final",
};

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

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const viewMode = params.view === "group" ? "group" : "date";
  let matches: Match[] = FALLBACK_MATCHES;

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
        home_team:teams!matches_home_team_id_fkey(name, code, flag_url),
        away_team:teams!matches_away_team_id_fkey(name, code, flag_url)
      `)
      .order("match_date", { ascending: true });
    if (data?.length) {
      matches = data.map((d) => ({
        ...d,
        home_team: Array.isArray(d.home_team) ? d.home_team[0] ?? null : d.home_team,
        away_team: Array.isArray(d.away_team) ? d.away_team[0] ?? null : d.away_team,
      })) as Match[];
    }
  }

  let grouped: Record<string, Match[]>;

  if (viewMode === "group") {
    grouped = (matches ?? []).reduce(
      (acc: Record<string, Match[]>, match: Match) => {
        const key = match.group_name
          ? `Group ${match.group_name}`
          : STAGE_LABELS[match.stage] ?? match.stage;
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
      },
      {} as Record<string, Match[]>
    );
  } else {
    grouped = (matches ?? []).reduce(
      (acc: Record<string, Match[]>, match: Match) => {
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
      {} as Record<string, Match[]>
    );
  }

  const sectionKeys = Object.keys(grouped);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Match Results</h1>
        <Link href="/resources/form-guide" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          Form guide →
        </Link>
      </div>
      <p className="text-gray-400 mb-4">Full schedule and results</p>
      <GroupToggle current={viewMode} sections={viewMode === "group" ? sectionKeys : undefined} />

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 bg-[#1e2d3d] rounded-xl border border-gray-700/50">
          <p className="text-gray-400 text-lg">No matches loaded yet.</p>
        </div>
      )}

      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div key={stage} id={stage.replace(/\s+/g, "-").toLowerCase()} className="mb-8 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">{stage}</h2>
          <div className="space-y-2">
            {stageMatches.map((match) => {
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
                    <span className="flex-1 flex items-center justify-end gap-2 font-medium text-gray-100">
                      {match.home_team?.name ?? "TBD"}
                      {match.home_team?.flag_url && (
                        <Image src={match.home_team.flag_url} alt="" width={24} height={16} className="w-6 h-4 object-contain" />
                      )}
                    </span>
                    <span className="font-bold text-lg min-w-15 text-center text-white">
                      {match.status === "FINISHED" || match.status === "LIVE"
                        ? `${match.home_score} - ${match.away_score}`
                        : "vs"}
                    </span>
                    <span className="flex-1 flex items-center gap-2 font-medium text-gray-100">
                      {match.away_team?.flag_url && (
                        <Image src={match.away_team.flag_url} alt="" width={24} height={16} className="w-6 h-4 object-contain" />
                      )}
                      {match.away_team?.name ?? "TBD"}
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
