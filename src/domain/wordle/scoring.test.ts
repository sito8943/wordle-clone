import { describe, expect, it } from "vitest";
import {
  getDifficultyScoreMultiplier,
  getInsaneTimeBonus,
  getPointsForWin,
  getTotalPointsForWin,
} from "./scoring";
import { DIFFICULTY_SCORE_MULTIPLIERS } from "./constants";

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
  it("multiplies base points by difficulty and then adds streak bonuses", () => {
    expect(getTotalPointsForWin(1, 2, 1)).toBe(13);
    expect(getTotalPointsForWin(4, 3, 5)).toBe(14);
  });

  it("adds a time bonus when provided", () => {
    expect(getTotalPointsForWin(3, 4, 2, 5)).toBe(23);
  });

  it("normalizes invalid multipliers and streak bonus values", () => {
    expect(getTotalPointsForWin(1, 0, -4)).toBe(6);
    expect(getTotalPointsForWin(1, Number.NaN, Number.NaN)).toBe(6);
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
