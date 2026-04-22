import { describe, expect, it } from "vitest";
import {
  clearAllDailyModeOutcomes,
  clearDailyModeOutcome,
  getMillisUntilEndOfDayUTC,
  getTodayDateUTC,
  readDailyModeOutcomeForDate,
  resolveDailyAnswer,
  resolveDeterministicDailyWord,
  writeDailyModeOutcomeForDate,
} from "./daily";

describe("daily word helpers", () => {
  it("returns UTC date in YYYY-MM-DD format", () => {
    expect(getTodayDateUTC()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("resolves deterministic fallback word from dictionary for a date", () => {
    const words = ["casa", "perro", "luz", "amor"];

    const first = resolveDeterministicDailyWord(words, "2026-04-22");
    const second = resolveDeterministicDailyWord(words, "2026-04-22");

    expect(first).toBe(second);
    expect(["CASA", "PERRO", "LUZ", "AMOR"]).toContain(first);
  });

  it("prefers remote daily word when it exists in dictionary", () => {
    const answer = resolveDailyAnswer({
      words: ["casa", "puente", "luz"],
      date: "2026-04-22",
      remoteDailyWord: "PUENTE",
    });

    expect(answer).toBe("PUENTE");
  });

  it("falls back to deterministic dictionary word when remote daily word is missing", () => {
    const answer = resolveDailyAnswer({
      words: ["casa", "puente", "luz"],
      date: "2026-04-22",
      remoteDailyWord: "INEXISTENTE",
    });

    expect(["CASA", "PUENTE", "LUZ"]).toContain(answer);
    expect(answer).not.toBe("INEXISTENTE");
  });

  it("returns positive millis until next UTC day", () => {
    const millis = getMillisUntilEndOfDayUTC();

    expect(millis).toBeGreaterThan(0);
    expect(millis).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it("stores and reads daily mode outcome by player code and date", () => {
    localStorage.clear();
    const date = "2026-04-22";

    writeDailyModeOutcomeForDate({
      outcome: "won",
      playerCode: "ab12",
      date,
    });

    expect(readDailyModeOutcomeForDate("AB12", date)).toBe("won");
    expect(readDailyModeOutcomeForDate("CD34", date)).toBeNull();
  });

  it("ignores stored outcome when date does not match", () => {
    localStorage.clear();

    writeDailyModeOutcomeForDate({
      outcome: "lost",
      playerCode: "AB12",
      date: "2026-04-21",
    });

    expect(readDailyModeOutcomeForDate("AB12", "2026-04-22")).toBeNull();
  });

  it("clears stored daily mode outcome", () => {
    localStorage.clear();
    const date = "2026-04-22";

    writeDailyModeOutcomeForDate({
      outcome: "lost",
      playerCode: "AB12",
      date,
    });
    expect(readDailyModeOutcomeForDate("AB12", date)).toBe("lost");

    clearDailyModeOutcome("AB12");
    expect(readDailyModeOutcomeForDate("AB12", date)).toBeNull();
  });

  it("clears daily mode outcomes for all local players", () => {
    localStorage.clear();
    const date = "2026-04-22";

    writeDailyModeOutcomeForDate({
      outcome: "won",
      playerCode: "AB12",
      date,
    });
    writeDailyModeOutcomeForDate({
      outcome: "lost",
      playerCode: "CD34",
      date,
    });
    writeDailyModeOutcomeForDate({
      outcome: "won",
      date,
    });

    clearAllDailyModeOutcomes();

    expect(readDailyModeOutcomeForDate("AB12", date)).toBeNull();
    expect(readDailyModeOutcomeForDate("CD34", date)).toBeNull();
    expect(readDailyModeOutcomeForDate(undefined, date)).toBeNull();
  });
});
