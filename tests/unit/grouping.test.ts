import { describe, it, expect } from "vitest";

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Group Stage",
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-Finals",
  SEMI_FINALS: "Semi-Finals",
  THIRD_PLACE: "Third Place",
  FINAL: "Final",
};

interface Match {
  id: number;
  match_date: string;
  stage: string;
  group_name: string | null;
  status: string;
}

function groupByDate(matches: Match[]): Record<string, Match[]> {
  return matches.reduce(
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

function groupByStage(matches: Match[]): Record<string, Match[]> {
  return matches.reduce(
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
}

const SAMPLE_MATCHES: Match[] = [
  { id: 1, match_date: "2026-06-11T18:00:00Z", stage: "GROUP_STAGE", group_name: "A", status: "FINISHED" },
  { id: 2, match_date: "2026-06-11T21:00:00Z", stage: "GROUP_STAGE", group_name: "A", status: "FINISHED" },
  { id: 3, match_date: "2026-06-12T18:00:00Z", stage: "GROUP_STAGE", group_name: "B", status: "SCHEDULED" },
  { id: 4, match_date: "2026-07-19T20:00:00Z", stage: "FINAL", group_name: null, status: "SCHEDULED" },
];

describe("groupByStage", () => {
  it("groups matches into correct stage/group buckets", () => {
    const grouped = groupByStage(SAMPLE_MATCHES);
    expect(Object.keys(grouped)).toContain("Group A");
    expect(Object.keys(grouped)).toContain("Group B");
    expect(Object.keys(grouped)).toContain("Final");
    expect(grouped["Group A"]).toHaveLength(2);
    expect(grouped["Group B"]).toHaveLength(1);
    expect(grouped["Final"]).toHaveLength(1);
  });

  it("uses STAGE_LABELS for non-group matches", () => {
    const grouped = groupByStage([
      { id: 5, match_date: "2026-07-10T20:00:00Z", stage: "QUARTER_FINALS", group_name: null, status: "SCHEDULED" },
    ]);
    expect(Object.keys(grouped)).toContain("Quarter-Finals");
  });

  it("falls back to raw stage name for unknown stages", () => {
    const grouped = groupByStage([
      { id: 6, match_date: "2026-07-10T20:00:00Z", stage: "UNKNOWN_STAGE", group_name: null, status: "SCHEDULED" },
    ]);
    expect(Object.keys(grouped)).toContain("UNKNOWN_STAGE");
  });
});

describe("groupByDate", () => {
  it("groups matches by their date", () => {
    const grouped = groupByDate(SAMPLE_MATCHES);
    const keys = Object.keys(grouped);
    // Should have at least 2 different dates (June 11, June 12, July 19)
    expect(keys.length).toBeGreaterThanOrEqual(2);
  });

  it("puts same-day matches in the same group", () => {
    const grouped = groupByDate(SAMPLE_MATCHES);
    // Both June 11 matches should be together
    const june11Key = Object.keys(grouped).find((k) => k.includes("June") && k.includes("11"));
    expect(june11Key).toBeDefined();
    expect(grouped[june11Key!]).toHaveLength(2);
  });
});
