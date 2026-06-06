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

    let updated = 0;
    let scored = 0;

    for (const apiMatch of matches) {
      const status = apiMatch.status === "FINISHED"
        ? "FINISHED"
        : apiMatch.status === "IN_PLAY" || apiMatch.status === "PAUSED"
        ? "LIVE"
        : "SCHEDULED";

      const homeScore = apiMatch.score?.fullTime?.home ?? null;
      const awayScore = apiMatch.score?.fullTime?.away ?? null;

      // Update match in our database
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id, status")
        .eq("external_id", apiMatch.id)
        .single();

      if (existingMatch) {
        const wasNotFinished = existingMatch.status !== "FINISHED";

        await supabase
          .from("matches")
          .update({
            status,
            home_score: homeScore,
            away_score: awayScore,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMatch.id);

        updated++;

        // If match just finished, calculate points
        if (wasNotFinished && status === "FINISHED" && homeScore !== null) {
          await supabase.rpc("score_match", { p_match_id: existingMatch.id });
          scored++;
        }
      }
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
