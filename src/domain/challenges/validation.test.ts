import { describe, expect, it } from "vitest";
import type { GuessResult } from "@domain/wordle";
import type { ChallengeConditionContext } from "./types";
import { evaluateCondition } from "./validation";

const row = (word: string, statuses: GuessResult["statuses"]): GuessResult => ({
  word,
  statuses,
});

const createContext = (
  overrides: Partial<ChallengeConditionContext> = {},
): ChallengeConditionContext => ({
  guesses: [],
  gameOver: false,
  won: false,
  answer: "APPLE",
  playerDifficulty: "normal",
  roundDurationMs: 120_000,
  dailyCompletedRounds: 0,
  dailyWonRounds: 0,
  dailyConsecutiveWins: 0,
  hintsUsed: 0,
  ...overrides,
});

describe("challenge condition evaluators", () => {
  it("evaluates comeback", () => {
    expect(
      evaluateCondition(
        "comeback",
        createContext({
          won: true,
          guesses: [
            row("A", []),
            row("B", []),
            row("C", []),
            row("D", []),
            row("E", []),
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "comeback",
        createContext({
          won: true,
          guesses: [
            row("A", []),
            row("B", []),
            row("C", []),
            row("D", []),
            row("E", []),
            row("F", []),
          ],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "comeback",
        createContext({
          won: true,
          maxGuesses: 4,
          guesses: [row("A", []), row("B", []), row("C", []), row("D", [])],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates steady_player", () => {
    expect(evaluateCondition("steady_player", createContext())).toBe(false);
    expect(
      evaluateCondition("steady_player", createContext({ won: true })),
    ).toBe(true);
  });

  it("evaluates risky", () => {
    expect(
      evaluateCondition(
        "risky",
        createContext({
          guesses: [row("CRANE", []), row("SLATE", [])],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "risky",
        createContext({
          guesses: [row("CRANE", []), row("CRANE", [])],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates persistent", () => {
    expect(
      evaluateCondition(
        "persistent",
        createContext({
          dailyWonRounds: 1,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "persistent",
        createContext({
          dailyWonRounds: 2,
        }),
      ),
    ).toBe(true);
  });

  it("evaluates no_repeat_n_letters", () => {
    expect(
      evaluateCondition(
        "no_repeat_n_letters",
        createContext({
          guesses: [row("CRANE", []), row("SLATE", [])],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "no_repeat_n_letters",
        createContext({
          guesses: [row("APPLE", [])],
        }),
      ),
    ).toBe(false);
  });

  it("evaluates same_n_starts", () => {
    expect(
      evaluateCondition(
        "same_n_starts",
        createContext({
          guesses: [row("APPLE", []), row("BRICK", [])],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "same_n_starts",
        createContext({
          guesses: [row("APPLE", []), row("ALERT", [])],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates same_n_ends", () => {
    expect(
      evaluateCondition(
        "same_n_ends",
        createContext({
          guesses: [row("APPLE", []), row("ALERT", [])],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "same_n_ends",
        createContext({
          guesses: [row("APPLE", []), row("CRANE", [])],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates late_win", () => {
    expect(
      evaluateCondition(
        "late_win",
        createContext({
          won: true,
          roundDurationMs: 181_000,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "late_win",
        createContext({
          won: true,
          roundDurationMs: 179_000,
        }),
      ),
    ).toBe(true);
  });

  it("evaluates yellow_focus", () => {
    expect(
      evaluateCondition(
        "yellow_focus",
        createContext({
          guesses: [
            row("AUDIO", ["present", "present", "absent", "absent", "absent"]),
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "yellow_focus",
        createContext({
          guesses: [
            row("AUDIO", ["present", "present", "present", "absent", "absent"]),
          ],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates no_hints", () => {
    expect(
      evaluateCondition(
        "no_hints",
        createContext({
          won: true,
          hintsUsed: 1,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "no_hints",
        createContext({
          won: true,
          hintsUsed: 0,
        }),
      ),
    ).toBe(true);
  });

  it("evaluates speedster", () => {
    expect(
      evaluateCondition(
        "speedster",
        createContext({
          won: true,
          roundDurationMs: 60_000,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "speedster",
        createContext({
          won: true,
          roundDurationMs: 59_000,
        }),
      ),
    ).toBe(true);
  });

  it("evaluates reckless", () => {
    expect(
      evaluateCondition(
        "reckless",
        createContext({
          guesses: [row("CRANE", []), row("SLATE", [])],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "reckless",
        createContext({
          guesses: [row("CRANE", []), row("CRANE", [])],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates palindrome_guess", () => {
    expect(
      evaluateCondition(
        "palindrome_guess",
        createContext({
          won: true,
          answer: "APPLE",
          guesses: [
            row("APPLE", [
              "correct",
              "correct",
              "correct",
              "correct",
              "correct",
            ]),
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "palindrome_guess",
        createContext({
          won: true,
          answer: "RADAR",
          guesses: [
            row("RADAR", [
              "correct",
              "correct",
              "correct",
              "correct",
              "correct",
            ]),
          ],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates no_repeat_letters", () => {
    expect(
      evaluateCondition(
        "no_repeat_letters",
        createContext({
          won: true,
          guesses: [row("CRANE", []), row("SLATE", [])],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "no_repeat_letters",
        createContext({
          won: true,
          guesses: [row("APPLE", [])],
        }),
      ),
    ).toBe(false);
  });

  it("evaluates same_start", () => {
    expect(
      evaluateCondition(
        "same_start",
        createContext({
          guesses: [row("CRANE", []), row("CROWN", [])],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "same_start",
        createContext({
          guesses: [row("CRANE", []), row("BROWN", [])],
        }),
      ),
    ).toBe(false);
  });

  it("evaluates ends_same_letter", () => {
    expect(
      evaluateCondition(
        "ends_same_letter",
        createContext({
          guesses: [row("APPLE", []), row("CRANE", [])],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "ends_same_letter",
        createContext({
          guesses: [row("APPLE", []), row("ALERT", [])],
        }),
      ),
    ).toBe(false);
  });

  it("evaluates alphabetical_order", () => {
    expect(
      evaluateCondition(
        "alphabetical_order",
        createContext({
          guesses: [row("APPLE", []), row("CRANE", []), row("SLATE", [])],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "alphabetical_order",
        createContext({
          guesses: [row("SLATE", []), row("CRANE", [])],
        }),
      ),
    ).toBe(false);
  });

  it("evaluates green_focus", () => {
    expect(
      evaluateCondition(
        "green_focus",
        createContext({
          guesses: [
            row("APPLE", ["correct", "correct", "absent", "absent", "absent"]),
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "green_focus",
        createContext({
          guesses: [
            row("APPLE", ["correct", "correct", "correct", "absent", "absent"]),
          ],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates rare_letters", () => {
    expect(
      evaluateCondition(
        "rare_letters",
        createContext({
          guesses: [row("QAZAZ", []), row("JAZZY", [])],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "rare_letters",
        createContext({
          guesses: [row("QZXJQ", [])],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates no_misplaced", () => {
    expect(
      evaluateCondition(
        "no_misplaced",
        createContext({
          guesses: [
            row("APPLE", ["absent", "present", "absent", "absent", "absent"]),
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "no_misplaced",
        createContext({
          guesses: [
            row("APPLE", ["absent", "correct", "absent", "absent", "absent"]),
          ],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates same_vowel_pattern", () => {
    expect(
      evaluateCondition(
        "same_vowel_pattern",
        createContext({
          guesses: [row("CASAS", []), row("MAMAS", [])],
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "same_vowel_pattern",
        createContext({
          guesses: [row("AUDIO", [])],
        }),
      ),
    ).toBe(false);
  });
});
