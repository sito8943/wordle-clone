import { describe, expect, it } from "vitest";
import { MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS } from "./constants";
import {
  getRoundDurationMs,
  isScoreCommitDurationSuspicious,
} from "./security";

describe("getRoundDurationMs", () => {
  it("returns the duration when both timestamps are valid", () => {
    expect(getRoundDurationMs(1_000, 4_250)).toBe(3_250);
  });

  it("returns null when timestamps are invalid", () => {
    expect(getRoundDurationMs(Number.NaN, 4_000)).toBeNull();
    expect(getRoundDurationMs(1_000, Number.POSITIVE_INFINITY)).toBeNull();
    expect(getRoundDurationMs(0, 4_000)).toBeNull();
  });

  it("returns null when round end is before round start", () => {
    expect(getRoundDurationMs(5_000, 4_000)).toBeNull();
  });
});

describe("isScoreCommitDurationSuspicious", () => {
  it("flags durations below the threshold", () => {
    expect(
      isScoreCommitDurationSuspicious(
        MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS - 1,
      ),
    ).toBe(true);
  });

  it("accepts durations equal or above the threshold", () => {
    expect(
      isScoreCommitDurationSuspicious(MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS),
    ).toBe(false);
    expect(
      isScoreCommitDurationSuspicious(
        MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS + 1_000,
      ),
    ).toBe(false);
  });

  it("returns false for invalid values", () => {
    expect(isScoreCommitDurationSuspicious(Number.NaN)).toBe(false);
    expect(isScoreCommitDurationSuspicious(-1)).toBe(false);
    expect(isScoreCommitDurationSuspicious(100, 0)).toBe(false);
  });
});
