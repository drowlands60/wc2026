import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// This route is called by a cron job (e.g., Vercel Cron or external service)
// to update match scores from football-data.org API
// football-data.org free tier: 10 requests/minute

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";
const COMPETITION_ID = 2000; // FIFA World Cup

export async function GET(request: Request) {
  // Verify the request is authorized (use a secret token)
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // Use service role for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Fetch matches from football-data.org
    const response = await fetch(`${FOOTBALL_DATA_BASE}/competitions/${COMPETITION_ID}/matches`, {
      headers: { "X-Auth-Token": apiKey },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Football API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const matches = data.matches ?? [];

    // Fetch all existing matches in one query
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("id, external_id, status");

    const matchMap = new Map<number, { id: string; status: string }>();
    for (const m of existingMatches ?? []) {
      matchMap.set(m.external_id, { id: m.id, status: m.status });
    }

    let updated = 0;
    let scored = 0;
    const now = new Date().toISOString();
    const updateRows: { id: string; status: string; home_score: number | null; away_score: number | null; updated_at: string }[] = [];
    const matchesToScore: string[] = [];

    for (const apiMatch of matches) {
      const existing = matchMap.get(apiMatch.id);
      if (!existing) continue;

      const status = apiMatch.status === "FINISHED"
        ? "FINISHED"
        : apiMatch.status === "IN_PLAY" || apiMatch.status === "PAUSED"
        ? "LIVE"
        : "SCHEDULED";

      // Use regularTime (90 mins + stoppage) to ignore extra time and penalties
      const homeScore = apiMatch.score?.regularTime?.home ?? apiMatch.score?.fullTime?.home ?? null;
      const awayScore = apiMatch.score?.regularTime?.away ?? apiMatch.score?.fullTime?.away ?? null;

      updateRows.push({
        id: existing.id,
        status,
        home_score: homeScore,
        away_score: awayScore,
        updated_at: now,
      });
      updated++;

      // If match just finished, queue it for scoring
      if (existing.status !== "FINISHED" && status === "FINISHED" && homeScore !== null) {
        matchesToScore.push(existing.id);
      }
    }

    // Batch update all matches
    if (updateRows.length > 0) {
      await supabase.from("matches").upsert(updateRows, { onConflict: "id" });
    }

    // Score newly finished matches (must be sequential since RPC may have side effects)
    for (const matchId of matchesToScore) {
      await supabase.rpc("score_match", { p_match_id: matchId });
      scored++;
    }

    return NextResponse.json({
      success: true,
      matches_updated: updated,
      matches_scored: scored,
      total_api_matches: matches.length,
    });
  } catch (error) {
    console.error("Score update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
