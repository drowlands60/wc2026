import { describe, it, expect } from "vitest";

/**
 * Tests for the match status mapping logic from the update-scores API route.
 */
function mapApiStatus(apiStatus: string): string {
  if (apiStatus === "FINISHED") return "FINISHED";
  if (apiStatus === "IN_PLAY" || apiStatus === "PAUSED") return "LIVE";
  return "SCHEDULED";
}

describe("mapApiStatus", () => {
  it("maps FINISHED correctly", () => {
    expect(mapApiStatus("FINISHED")).toBe("FINISHED");
  });

  it("maps IN_PLAY to LIVE", () => {
    expect(mapApiStatus("IN_PLAY")).toBe("LIVE");
  });

  it("maps PAUSED to LIVE", () => {
    expect(mapApiStatus("PAUSED")).toBe("LIVE");
  });

  it("maps SCHEDULED to SCHEDULED", () => {
    expect(mapApiStatus("SCHEDULED")).toBe("SCHEDULED");
  });

  it("maps unknown statuses to SCHEDULED", () => {
    expect(mapApiStatus("TIMED")).toBe("SCHEDULED");
    expect(mapApiStatus("POSTPONED")).toBe("SCHEDULED");
    expect(mapApiStatus("CANCELLED")).toBe("SCHEDULED");
  });
});

describe("lock logic", () => {
  function isMatchLocked(matchDate: string, status: string, now: Date): boolean {
    if (status !== "SCHEDULED") return true;
    const date = new Date(matchDate);
    const lockDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return now >= lockDate;
  }

  it("locks finished matches", () => {
    expect(isMatchLocked("2026-06-11T18:00:00Z", "FINISHED", new Date("2026-06-11T20:00:00Z"))).toBe(true);
  });

  it("locks live matches", () => {
    expect(isMatchLocked("2026-06-11T18:00:00Z", "LIVE", new Date("2026-06-11T18:30:00Z"))).toBe(true);
  });

  it("locks scheduled matches on match day", () => {
    // Match at 6pm, checking at 1am same day (after midnight)
    expect(isMatchLocked("2026-06-11T18:00:00Z", "SCHEDULED", new Date("2026-06-11T01:00:00Z"))).toBe(true);
  });

  it("does not lock scheduled matches well before match day", () => {
    expect(isMatchLocked("2026-06-12T18:00:00Z", "SCHEDULED", new Date("2026-06-10T12:00:00Z"))).toBe(false);
  });
});
