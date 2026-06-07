import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Seed/update matches from football-data.org API
// Called by Vercel cron every 24 hours

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const COMPETITION_ID = 2000; // FIFA World Cup

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Fetch matches from football-data.org
    const matchesResponse = await fetch(
      `${FOOTBALL_DATA_BASE}/competitions/${COMPETITION_ID}/matches?season=2026`,
      { headers: { "X-Auth-Token": apiKey } }
    );

    if (!matchesResponse.ok) {
      return NextResponse.json(
        { error: `Matches API error: ${matchesResponse.status}` },
        { status: 502 }
      );
    }

    const matchesData = await matchesResponse.json();
    const matches = matchesData.matches ?? [];

    // Extract and upsert teams
    const teamsMap = new Map<string, { name: string; tla: string; crest: string; group: string | null }>();
    for (const match of matches) {
      if (match.homeTeam?.tla) {
        teamsMap.set(match.homeTeam.tla, {
          name: match.homeTeam.name,
          tla: match.homeTeam.tla,
          crest: match.homeTeam.crest,
          group: match.group?.replace("GROUP_", "") ?? null,
        });
      }
      if (match.awayTeam?.tla) {
        teamsMap.set(match.awayTeam.tla, {
          name: match.awayTeam.name,
          tla: match.awayTeam.tla,
          crest: match.awayTeam.crest,
          group: match.group?.replace("GROUP_", "") ?? null,
        });
      }
    }

    const teamsArray = Array.from(teamsMap.values());
    await supabase.from("teams").upsert(
      teamsArray.map((team) => ({
        name: team.name,
        code: team.tla,
        group_name: team.group,
        flag_url: team.crest,
      })),
      { onConflict: "code" }
    );

    // Fetch all teams in one query to build a code->id map
    const { data: allTeams } = await supabase.from("teams").select("id, code");
    const teamIdMap = new Map<string, string>();
    for (const t of allTeams ?? []) {
      teamIdMap.set(t.code, t.id);
    }

    // Upsert matches in a single batch
    const matchRows = matches.map((apiMatch: Record<string, unknown>) => {
      const homeCode = (apiMatch.homeTeam as Record<string, unknown>)?.tla as string | undefined;
      const awayCode = (apiMatch.awayTeam as Record<string, unknown>)?.tla as string | undefined;
      const score = apiMatch.score as Record<string, unknown> | undefined;
      // Use regularTime (90 mins + stoppage) to ignore extra time and penalties
      const regularTime = score?.regularTime as Record<string, unknown> | undefined;
      const fullTime = score?.fullTime as Record<string, unknown> | undefined;

      const status = apiMatch.status === "FINISHED"
        ? "FINISHED"
        : apiMatch.status === "IN_PLAY" || apiMatch.status === "PAUSED"
        ? "LIVE"
        : "SCHEDULED";

      return {
        external_id: apiMatch.id,
        home_team_id: homeCode ? teamIdMap.get(homeCode) ?? null : null,
        away_team_id: awayCode ? teamIdMap.get(awayCode) ?? null : null,
        home_score: (regularTime?.home as number) ?? (fullTime?.home as number) ?? null,
        away_score: (regularTime?.away as number) ?? (fullTime?.away as number) ?? null,
        match_date: apiMatch.utcDate,
        stage: apiMatch.stage,
        group_name: (apiMatch.group as string)?.replace("GROUP_", "") ?? null,
        status,
        matchday: apiMatch.matchday,
      };
    });

    await supabase.from("matches").upsert(matchRows, { onConflict: "external_id" });
    const seeded = matchRows.length;

    return NextResponse.json({
      success: true,
      teams_count: teamsArray.length,
      matches_seeded: seeded,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
