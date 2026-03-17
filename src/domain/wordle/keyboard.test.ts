import { describe, expect, it } from "vitest";
import { getKeyStatuses } from "./keyboard";
import type { GuessResult } from "./types";

const makeGuess = (
  word: string,
  statuses: GuessResult["statuses"],
): GuessResult => ({
  word,
  statuses,
});

describe("getKeyStatuses", () => {
  it("returns empty object when there are no guesses", () => {
    expect(getKeyStatuses([])).toEqual({});
  });

  it("maps each letter to its status", () => {
    const result = getKeyStatuses([makeGuess("AB", ["correct", "absent"])]);
    expect(result["A"]).toBe("correct");
    expect(result["B"]).toBe("absent");
  });

  it("correct takes priority over present", () => {
    const result = getKeyStatuses([makeGuess("AA", ["present", "correct"])]);
    expect(result["A"]).toBe("correct");
  });

  it("correct takes priority over absent", () => {
    const result = getKeyStatuses([makeGuess("AA", ["absent", "correct"])]);
    expect(result["A"]).toBe("correct");
  });

  it("present takes priority over absent", () => {
    const result = getKeyStatuses([makeGuess("AA", ["absent", "present"])]);
    expect(result["A"]).toBe("present");
  });

  it("does not downgrade a correct status in subsequent guesses", () => {
    const result = getKeyStatuses([
      makeGuess("A", ["correct"]),
      makeGuess("A", ["absent"]),
    ]);
    expect(result["A"]).toBe("correct");
  });

  it("does not downgrade a present status to absent", () => {
    const result = getKeyStatuses([
      makeGuess("A", ["present"]),
      makeGuess("A", ["absent"]),
    ]);
    expect(result["A"]).toBe("present");
  });

  it("handles multiple guesses with different letters", () => {
    const result = getKeyStatuses([
      makeGuess("AB", ["correct", "absent"]),
      makeGuess("CD", ["present", "correct"]),
    ]);
    expect(result["A"]).toBe("correct");
    expect(result["B"]).toBe("absent");
    expect(result["C"]).toBe("present");
    expect(result["D"]).toBe("correct");
  });

  it("upgrades absent to correct across guesses", () => {
    const result = getKeyStatuses([
      makeGuess("A", ["absent"]),
      makeGuess("A", ["correct"]),
    ]);
    expect(result["A"]).toBe("correct");
  });
});
