import { beforeEach, describe, expect, it } from "vitest";
import {
  readDailyChallengeRoundTracker,
  recordDailyChallengeRoundCompletion,
} from "./tracker";

describe("daily challenges round tracker", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("tracks completed rounds, won rounds and consecutive wins", () => {
    const date = "2026-04-11";
    const playerCode = "AB12";

    const first = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: true,
    });
    const second = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: false,
    });
    const third = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: true,
    });
    const fourth = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: true,
    });

    expect(first).toEqual({
      date,
      completedRounds: 1,
      wonRounds: 1,
      consecutiveWins: 1,
    });
    expect(second).toEqual({
      date,
      completedRounds: 2,
      wonRounds: 1,
      consecutiveWins: 0,
    });
    expect(third).toEqual({
      date,
      completedRounds: 3,
      wonRounds: 2,
      consecutiveWins: 1,
    });
    expect(fourth).toEqual({
      date,
      completedRounds: 4,
      wonRounds: 3,
      consecutiveWins: 2,
    });
  });

  it("resets consecutive wins after a loss", () => {
    const date = "2026-04-11";
    const playerCode = "AB12";

    recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: true,
    });
    const afterLoss = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: false,
    });
    const afterNextWin = recordDailyChallengeRoundCompletion({
      date,
      playerCode,
      won: true,
    });

    expect(afterLoss.consecutiveWins).toBe(0);
    expect(afterLoss.wonRounds).toBe(1);
    expect(afterNextWin.consecutiveWins).toBe(1);
    expect(afterNextWin.wonRounds).toBe(2);
  });

  it("resets tracker when reading on a different UTC date", () => {
    const playerCode = "AB12";

    recordDailyChallengeRoundCompletion({
      date: "2026-04-11",
      playerCode,
      won: true,
    });

    expect(readDailyChallengeRoundTracker("2026-04-12", playerCode)).toEqual({
      date: "2026-04-12",
      completedRounds: 0,
      wonRounds: 0,
      consecutiveWins: 0,
    });
  });
});
