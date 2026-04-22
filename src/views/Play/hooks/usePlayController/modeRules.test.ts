import { describe, expect, it } from "vitest";
import { WORDLE_MODE_IDS, getTotalPointsForWin } from "@domain/wordle";
import {
  resolveVictoryOutcomeForMode,
  shouldCompleteChallengesForMode,
} from "./modeRules";

describe("shouldCompleteChallengesForMode", () => {
  it("returns false for lightning and daily", () => {
    expect(shouldCompleteChallengesForMode(WORDLE_MODE_IDS.LIGHTNING)).toBe(
      false,
    );
    expect(shouldCompleteChallengesForMode(WORDLE_MODE_IDS.DAILY)).toBe(false);
  });

  it("returns true for classic and zen", () => {
    expect(shouldCompleteChallengesForMode(WORDLE_MODE_IDS.CLASSIC)).toBe(true);
    expect(shouldCompleteChallengesForMode(WORDLE_MODE_IDS.ZEN)).toBe(true);
  });
});

describe("resolveVictoryOutcomeForMode", () => {
  it("awards one point for daily victories", () => {
    const outcome = resolveVictoryOutcomeForMode({
      modeId: WORDLE_MODE_IDS.DAILY,
      answer: "APPLE",
      guessesLength: 2,
      guessWords: ["SLATE", "APPLE"],
      playerDifficulty: "normal",
      playerStreak: 2,
      hardModeEnabled: false,
      hardModeSecondsLeft: 0,
    });

    expect(outcome.awardedPoints).toBe(1);
    expect(outcome.snapshot.scoreSummary).toEqual({
      items: [{ key: "base", value: 1 }],
      total: 1,
    });
    expect(outcome.snapshot.currentStreak).toBe(3);
    expect(outcome.snapshot.bestStreak).toBe(2);
  });

  it("uses regular scoring for non-daily modes", () => {
    const outcome = resolveVictoryOutcomeForMode({
      modeId: WORDLE_MODE_IDS.CLASSIC,
      answer: "APPLE",
      guessesLength: 3,
      guessWords: ["SLATE", "CRANE", "APPLE"],
      playerDifficulty: "hard",
      playerStreak: 2,
      hardModeEnabled: false,
      hardModeSecondsLeft: 0,
    });

    const summary = outcome.snapshot.scoreSummary;

    expect(outcome.awardedPoints).toBe(getTotalPointsForWin(3, 5, 2));
    expect(summary?.total).toBe(getTotalPointsForWin(3, 5, 2));
    expect(summary?.items).toEqual(
      expect.arrayContaining([
        { key: "base", value: 4 },
        { key: "difficulty", value: 5 },
      ]),
    );
    expect(summary?.items.some((item) => item.key === "streak")).toBe(true);
    expect(summary?.items.some((item) => item.key === "dictionary")).toBe(
      false,
    );
    expect(summary?.items.some((item) => item.key === "time")).toBe(false);
  });
});
