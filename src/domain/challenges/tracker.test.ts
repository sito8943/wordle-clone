import { beforeEach, describe, expect, it } from "vitest";
import {
  readDailyChallengeRoundTracker,
  recordDailyChallengeRoundCompletion,
} from "./tracker";

describe("daily challenges round tracker", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("increments completed rounds and deduplicates won languages", () => {
    const date = "2026-04-11";
    const playerCode = "AB12";

    const first = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      language: "en",
      won: true,
    });
    const second = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      language: "en",
      won: true,
    });
    const third = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      language: "es",
      won: true,
    });

    expect(first).toEqual({
      date,
      completedRounds: 1,
      consecutiveWins: 1,
      wonLanguages: ["en"],
    });
    expect(second).toEqual({
      date,
      completedRounds: 2,
      consecutiveWins: 2,
      wonLanguages: ["en"],
    });
    expect(third).toEqual({
      date,
      completedRounds: 3,
      consecutiveWins: 3,
      wonLanguages: ["en", "es"],
    });
  });

  it("resets consecutive wins after a loss", () => {
    const date = "2026-04-11";
    const playerCode = "AB12";

    recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      language: "en",
      won: true,
    });
    const afterLoss = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      language: "en",
      won: false,
    });
    const afterNextWin = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      language: "en",
      won: true,
    });

    expect(afterLoss.consecutiveWins).toBe(0);
    expect(afterNextWin.consecutiveWins).toBe(1);
  });

  it("resets tracker when reading on a different UTC date", () => {
    const playerCode = "AB12";

    recordDailyChallengeRoundCompletion({
      date: "2026-04-11",
      playerCode,
      language: "en",
      won: true,
    });

    expect(readDailyChallengeRoundTracker("2026-04-12", playerCode)).toEqual({
      date: "2026-04-12",
      completedRounds: 0,
      consecutiveWins: 0,
      wonLanguages: [],
    });
  });
});
