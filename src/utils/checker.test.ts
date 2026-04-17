import { describe, expect, it } from "vitest";
import { checkGuess } from "./checker";

describe("checkGuess", () => {
  it("marks all letters as correct when guess equals answer", () => {
    expect(checkGuess("CRANE", "CRANE")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("marks all letters as absent when no letter matches", () => {
    expect(checkGuess("BBBBB", "AAAAA")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("marks correct position as correct", () => {
    const result = checkGuess("CRANE", "CXXXX");
    expect(result[0]).toBe("correct");
    expect(result[1]).toBe("absent");
    expect(result[2]).toBe("absent");
    expect(result[3]).toBe("absent");
    expect(result[4]).toBe("absent");
  });

  it("marks letter present when it exists but in wrong position", () => {
    const result = checkGuess("AXXXX", "XAXXX");
    expect(result[0]).toBe("present");
  });

  it("handles duplicate letters in guess — only marks as many as in answer", () => {
    // Answer has one A, guess has two A's
    // First A is in correct position, second A should be absent
    const result = checkGuess("AAXXX", "AXXXX");
    expect(result[0]).toBe("correct");
    expect(result[1]).toBe("absent");
  });

  it("handles duplicate letters — present does not consume correct slot", () => {
    // Answer: ABBEY — A(0) B(1) B(2) E(3) Y(4)
    // Guess:  BABES — B(0) A(1) B(2) E(3) S(4)
    const result = checkGuess("BABES", "ABBEY");
    expect(result[0]).toBe("present"); // B is in answer but not position 0
    expect(result[1]).toBe("present"); // A is in answer but not position 1
    expect(result[2]).toBe("correct"); // B is correct at position 2
    expect(result[3]).toBe("correct"); // E is correct at position 3
    expect(result[4]).toBe("absent"); // S not in answer
  });

  it("does not mark extra duplicate as present when all instances are used", () => {
    // Answer: CRANE — only one E (at position 4)
    const result = checkGuess("EEEEE", "CRANE");
    // E is correct at position 4, all others are absent (no more E's in answer)
    const correctCount = result.filter((s) => s === "correct").length;
    const presentCount = result.filter((s) => s === "present").length;
    expect(correctCount + presentCount).toBe(1);
    expect(result[4]).toBe("correct");
  });

  it("returns an array with the same length as the guess", () => {
    expect(checkGuess("ABCDE", "VWXYZ")).toHaveLength(5);
    expect(checkGuess("ABC", "XYZ")).toHaveLength(3);
  });
});
