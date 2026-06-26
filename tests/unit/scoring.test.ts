import { describe, it, expect } from "vitest";

const STAGE_BONUS: Record<string, number> = {
  GROUP_STAGE: 0,
  LAST_32: 1,
  LAST_16: 2,
  QUARTER_FINALS: 3,
  SEMI_FINALS: 4,
  THIRD_PLACE: 4,
  FINAL: 5,
};

/**
 * Port of the SQL calculate_points function for testing.
 * Exact score: 3 points + knockout bonus (R32=+1, R16=+2, QF=+3, SF/3rd=+4, Final=+5)
 * Correct goal difference: 2 points
 * Correct result (win/draw/loss): 1 point
 * Otherwise: 0 points
 */
function calculatePoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  stage: string = "GROUP_STAGE"
): number {
  if (predHome === actualHome && predAway === actualAway) {
    return 3 + (STAGE_BONUS[stage] ?? 0);
  }
  if (predHome - predAway === actualHome - actualAway) {
    return 2;
  }
  if (Math.sign(predHome - predAway) === Math.sign(actualHome - actualAway)) {
    return 1;
  }
  return 0;
}

describe("calculatePoints", () => {
  it("awards 3 points for exact score in group stage", () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(3);
    expect(calculatePoints(0, 0, 0, 0)).toBe(3);
    expect(calculatePoints(3, 3, 3, 3, "GROUP_STAGE")).toBe(3);
  });

  it("awards bonus points for exact score in knockout rounds", () => {
    expect(calculatePoints(2, 1, 2, 1, "LAST_32")).toBe(4);
    expect(calculatePoints(2, 1, 2, 1, "LAST_16")).toBe(5);
    expect(calculatePoints(2, 1, 2, 1, "QUARTER_FINALS")).toBe(6);
    expect(calculatePoints(2, 1, 2, 1, "SEMI_FINALS")).toBe(7);
    expect(calculatePoints(2, 1, 2, 1, "THIRD_PLACE")).toBe(7);
    expect(calculatePoints(2, 1, 2, 1, "FINAL")).toBe(8);
  });

  it("awards 2 points for correct goal difference (no knockout bonus)", () => {
    // Predicted 2-1, actual 3-2 (both +1 difference)
    expect(calculatePoints(2, 1, 3, 2)).toBe(2);
    // Predicted 0-1, actual 1-2 (both -1 difference)
    expect(calculatePoints(0, 1, 1, 2)).toBe(2);
    // Predicted 1-1, actual 0-0 (both 0 difference)
    expect(calculatePoints(1, 1, 0, 0)).toBe(2);
    // No bonus for GD in knockout
    expect(calculatePoints(2, 1, 3, 2, "FINAL")).toBe(2);
  });

  it("awards 1 point for correct result direction", () => {
    // Predicted home win, actual home win (different margin)
    expect(calculatePoints(3, 0, 1, 0)).toBe(1);
    // Predicted away win, actual away win (different margin)
    expect(calculatePoints(0, 1, 0, 3)).toBe(1);
    // No bonus for result in knockout
    expect(calculatePoints(3, 0, 1, 0, "FINAL")).toBe(1);
  });

  it("awards 0 points for wrong result", () => {
    // Predicted home win, actual draw
    expect(calculatePoints(2, 1, 1, 1)).toBe(0);
    // Predicted draw, actual home win
    expect(calculatePoints(1, 1, 2, 0)).toBe(0);
    // Predicted home win, actual away win
    expect(calculatePoints(2, 0, 0, 1)).toBe(0);
  });

  it("handles high-scoring games", () => {
    expect(calculatePoints(5, 4, 5, 4)).toBe(3);
    expect(calculatePoints(4, 3, 5, 4)).toBe(2);
    expect(calculatePoints(3, 0, 5, 4)).toBe(1);
  });
});
