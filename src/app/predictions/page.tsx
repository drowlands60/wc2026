import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PredictionForm } from "@/components/PredictionForm";
import { AutoScrollToEditable } from "@/components/AutoScrollToEditable";
import { GroupToggle } from "@/components/GroupToggle";
import fixturesData from "@/data/fixtures.json";

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
  status: "SCHEDULED" as const,
  matchday: m.matchday,
  home_score: m.score?.fullTime?.home ?? null,
  away_score: m.score?.fullTime?.away ?? null,
  home_team: m.homeTeam?.tla ? { id: m.homeTeam.id, name: m.homeTeam.name, code: m.homeTeam.tla } : null,
  away_team: m.awayTeam?.tla ? { id: m.awayTeam.id, name: m.awayTeam.name, code: m.awayTeam.tla } : null,
}));

export default async function PredictionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const viewMode = params.view === "group" ? "group" : "date";
  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let matches: any[] = FALLBACK_MATCHES;
  let predictionsMap = new Map<number, any>();
  let allPredictionsMap = new Map<number, any[]>();
  let currentUserId: string | undefined;

  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
    currentUserId = user.id;

    const { data: dbMatches } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        stage,
        group_name,
        status,
        matchday,
        home_score,
        away_score,
        home_team:teams!matches_home_team_id_fkey(id, name, code, flag_url),
        away_team:teams!matches_away_team_id_fkey(id, name, code, flag_url)
      `)
      .order("match_date", { ascending: true }) as any;

    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", user.id);

    matches = dbMatches?.length ? dbMatches : FALLBACK_MATCHES;
    predictionsMap = new Map(
      predictions?.map((p: any) => [p.match_id, p]) ?? []
    );

    // Fetch all users' predictions for locked matches
    const now = new Date();
    const lockedMatchIds = matches
      .filter((m: any) => {
        const matchDate = new Date(m.match_date);
        const lockDate = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
        return m.status !== "SCHEDULED" || now >= lockDate;
      })
      .map((m: any) => m.id);

    if (lockedMatchIds.length > 0) {
      const { data: allPreds } = await supabase
        .from("predictions")
        .select("match_id, user_id, home_score, away_score, points, user:profiles!predictions_user_id_fkey(display_name)")
        .in("match_id", lockedMatchIds);

      if (allPreds) {
        for (const p of allPreds) {
          const list = allPredictionsMap.get(p.match_id) ?? [];
          list.push({
            user_id: p.user_id,
            display_name: (p.user as any)?.display_name ?? "Unknown",
            home_score: p.home_score,
            away_score: p.away_score,
            points: p.points,
          });
          allPredictionsMap.set(p.match_id, list);
        }
      }
    }
  }

  let grouped: Record<string, any[]>;

  if (viewMode === "group") {
    grouped = (matches ?? []).reduce(
      (acc: Record<string, any[]>, match: any) => {
        const key = match.group_name
          ? `Group ${match.group_name}`
          : STAGE_LABELS[match.stage] ?? match.stage;
        if (!acc[key]) acc[key] = [];
        acc[key].push(match);
        return acc;
      },
      {} as Record<string, any[]>
    );
  } else {
    grouped = (matches ?? []).reduce(
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
  }

  // Find the first editable match id
  const now = new Date();
  const firstEditableMatchId = (matches ?? []).find((match: any) => {
    const matchDate = new Date(match.match_date);
    const lockDate = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    return match.status === "SCHEDULED" && now < lockDate;
  })?.id;

  const sectionKeys = Object.keys(grouped);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {viewMode === "date" && <AutoScrollToEditable />}
      <h1 className="text-3xl font-bold text-white mb-2">My Predictions</h1>
      <p className="text-gray-400 mb-4">
        Enter your predicted scores for each match. Predictions lock at midnight on the day of each match.
      </p>
      <GroupToggle current={viewMode} sections={viewMode === "group" ? sectionKeys : undefined} />

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 bg-[#1e2d3d] rounded-xl border border-gray-700/50">
          <p className="text-gray-400 text-lg">No matches available yet.</p>
          <p className="text-gray-500 mt-2">Matches will appear once the tournament schedule is loaded.</p>
        </div>
      )}

      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div key={stage} id={stage.replace(/\s+/g, "-").toLowerCase()} className="mb-8 scroll-mt-24">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 py-2 border-b border-emerald-500/20">
            {stage}
          </h2>
          <div className="space-y-3">
            {(stageMatches as any[]).map((match: any) => {
              const prediction = predictionsMap.get(match.id);
              // Lock predictions at midnight (start of day) on match day
              const matchDate = new Date(match.match_date);
              const lockDate = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
              const isLocked = match.status !== "SCHEDULED" || new Date() >= lockDate;
              const isFirstEditable = match.id === firstEditableMatchId;
              return (
                <div key={match.id} id={isFirstEditable ? "first-editable-match" : undefined}>
                  <PredictionForm
                    match={match}
                    prediction={prediction}
                    isLocked={isLocked}
                    allPredictions={isLocked ? allPredictionsMap.get(match.id) : undefined}
                    currentUserId={currentUserId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
