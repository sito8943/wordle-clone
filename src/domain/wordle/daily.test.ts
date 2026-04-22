import { describe, expect, it } from "vitest";
import {
  getTodayDateUTC,
  resolveDailyAnswer,
  resolveDeterministicDailyWord,
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
});
