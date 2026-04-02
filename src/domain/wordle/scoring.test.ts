import { describe, expect, it } from "vitest";
import {
  getBaseScoreForWin,
  getDifficultyScoreMultiplier,
  getInsaneTimeBonus,
  getNormalDictionaryBonusRowFlags,
  getNormalDictionaryRowsBonusPoints,
  getPointsForWin,
  getStreakScoreMultiplier,
  getTotalPointsForWin,
} from "./scoring";
import { DIFFICULTY_SCORE_MULTIPLIERS } from "./constants";
import { setWordDictionary } from "@utils/words";

describe("getPointsForWin", () => {
  it("returns points based on attempts used with minimum 1 on valid wins", () => {
    expect(getPointsForWin(1)).toBe(6);
    expect(getPointsForWin(3)).toBe(4);
    expect(getPointsForWin(6)).toBe(1);
  });

  it("never returns negative points", () => {
    expect(getPointsForWin(7)).toBe(0);
  });
});

describe("getTotalPointsForWin", () => {
  it("multiplies score base by the streak multiplier", () => {
    expect(getTotalPointsForWin(1, 2, 1)).toBe(16);
    expect(getTotalPointsForWin(4, 3, 5)).toBe(15);
  });

  it("adds a time bonus when provided", () => {
    expect(getTotalPointsForWin(3, 4, 2, 5)).toBe(30);
  });

  it("normalizes invalid multipliers and streak values", () => {
    expect(getTotalPointsForWin(1, 0, -4)).toBe(6);
    expect(getTotalPointsForWin(1, Number.NaN, Number.NaN)).toBe(6);
  });
});

describe("getBaseScoreForWin", () => {
  it("combines difficulty-scaled points and time bonus before streak scaling", () => {
    expect(getBaseScoreForWin(3, 2)).toBe(8);
    expect(getBaseScoreForWin(3, 4, 5)).toBe(21);
  });

  it("supports decimal difficulty multipliers", () => {
    expect(getBaseScoreForWin(4, 3.2)).toBeCloseTo(9.6);
  });
});

describe("getStreakScoreMultiplier", () => {
  it("uses the square-root streak formula", () => {
    expect(getStreakScoreMultiplier(0)).toBe(1);
    expect(getStreakScoreMultiplier(1)).toBe(1.3);
    expect(getStreakScoreMultiplier(4)).toBe(1.6);
  });

  it("normalizes invalid streak values", () => {
    expect(getStreakScoreMultiplier(-2)).toBe(1);
    expect(getStreakScoreMultiplier(Number.NaN)).toBe(1);
  });
});

describe("getDifficultyScoreMultiplier", () => {
  it("returns the configured multiplier for each difficulty", () => {
    expect(getDifficultyScoreMultiplier("easy")).toBe(
      DIFFICULTY_SCORE_MULTIPLIERS.easy,
    );
    expect(getDifficultyScoreMultiplier("normal")).toBe(
      DIFFICULTY_SCORE_MULTIPLIERS.normal,
    );
    expect(getDifficultyScoreMultiplier("hard")).toBe(
      DIFFICULTY_SCORE_MULTIPLIERS.hard,
    );
    expect(getDifficultyScoreMultiplier("insane")).toBe(
      DIFFICULTY_SCORE_MULTIPLIERS.insane,
    );
  });
});

describe("getInsaneTimeBonus", () => {
  it("grants 1 point for every 2 seconds remaining", () => {
    expect(getInsaneTimeBonus(10)).toBe(5);
    expect(getInsaneTimeBonus(11)).toBe(5);
  });

  it("returns 0 when there are 0 or 1 seconds left", () => {
    expect(getInsaneTimeBonus(0)).toBe(0);
    expect(getInsaneTimeBonus(1)).toBe(0);
  });
});

describe("getNormalDictionaryRowsBonusPoints", () => {
  it("applies the default 0.4 bonus only to dictionary rows that are not the answer", () => {
    setWordDictionary([
      "apple",
      "crane",
      "slate",
      "brick",
      "pride",
      "cloud",
      "lemon",
    ]);

    expect(
      getNormalDictionaryRowsBonusPoints(
        ["CRANE", "SLATE", "BRICK", "PRIDE", "CLOUD", "LEMON"],
        "APPLE",
      ),
    ).toBe(2.4);
  });

  it("returns 0.4 for one valid wrong dictionary row", () => {
    setWordDictionary(["apple", "crane"]);

    expect(getNormalDictionaryRowsBonusPoints(["CRANE"], "APPLE")).toBe(0.4);
  });

  it("excludes answer rows from the loss bonus", () => {
    setWordDictionary(["apple", "crane"]);

    expect(
      getNormalDictionaryRowsBonusPoints(["APPLE", "CRANE"], "APPLE", 1),
    ).toBe(1);
  });

  it("returns 0 for invalid or non-positive per-row bonuses", () => {
    setWordDictionary(["apple", "crane"]);

    expect(
      getNormalDictionaryRowsBonusPoints(["CRANE"], "APPLE", Number.NaN),
    ).toBe(0);
    expect(getNormalDictionaryRowsBonusPoints(["CRANE"], "APPLE", 0)).toBe(0);
    expect(getNormalDictionaryRowsBonusPoints(["CRANE"], "APPLE", -1)).toBe(0);
  });
});

describe("getNormalDictionaryBonusRowFlags", () => {
  it("marks only wrong dictionary words as bonus rows", () => {
    setWordDictionary(["apple", "crane", "slate"]);

    expect(
      getNormalDictionaryBonusRowFlags(
        ["CRANE", "ZZZZZ", "APPLE", "", "slate"],
        "APPLE",
      ),
    ).toEqual([true, false, false, false, true]);
  });
});
