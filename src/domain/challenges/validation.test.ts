import { describe, expect, it } from "vitest";
import type { ChallengeConditionContext } from "./types";
import { evaluateCondition } from "./validation";

const createContext = (
  overrides: Partial<ChallengeConditionContext> = {},
): ChallengeConditionContext => ({
  guesses: [],
  gameOver: false,
  won: false,
  answer: "APPLE",
  difficulty: "normal",
  streak: 0,
  roundDurationMs: 120_000,
  language: "es",
  dailyCompletedRounds: 0,
  dailyLanguagesWon: [],
  ...overrides,
});

describe("challenge condition evaluators", () => {
  it("evaluates first_guess", () => {
    expect(evaluateCondition("first_guess", createContext())).toBe(false);
    expect(
      evaluateCondition(
        "first_guess",
        createContext({
          guesses: [{ word: "APPLE", statuses: ["correct"] }],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates complete_round", () => {
    expect(evaluateCondition("complete_round", createContext())).toBe(false);
    expect(
      evaluateCondition("complete_round", createContext({ gameOver: true })),
    ).toBe(true);
  });

  it("evaluates unique_letters", () => {
    expect(evaluateCondition("unique_letters", createContext())).toBe(false);
    expect(
      evaluateCondition(
        "unique_letters",
        createContext({
          guesses: [{ word: "AABBB", statuses: ["correct"] }],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "unique_letters",
        createContext({
          guesses: [{ word: "CRANE", statuses: ["correct"] }],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates three_guesses", () => {
    expect(
      evaluateCondition(
        "three_guesses",
        createContext({
          guesses: [
            { word: "A", statuses: [] },
            { word: "B", statuses: [] },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "three_guesses",
        createContext({
          guesses: [
            { word: "A", statuses: [] },
            { word: "B", statuses: [] },
            { word: "C", statuses: [] },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates vowels_first", () => {
    expect(evaluateCondition("vowels_first", createContext())).toBe(false);
    expect(
      evaluateCondition(
        "vowels_first",
        createContext({
          guesses: [{ word: "CRWTH", statuses: [] }],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "vowels_first",
        createContext({
          guesses: [{ word: "AUDIO", statuses: [] }],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates persistent", () => {
    expect(
      evaluateCondition(
        "persistent",
        createContext({
          dailyCompletedRounds: 1,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "persistent",
        createContext({
          dailyCompletedRounds: 2,
        }),
      ),
    ).toBe(true);
  });

  it("evaluates speedster", () => {
    expect(
      evaluateCondition(
        "speedster",
        createContext({ won: true, roundDurationMs: 60_000 }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "speedster",
        createContext({ won: true, roundDurationMs: 59_999 }),
      ),
    ).toBe(true);
  });

  it("evaluates genius", () => {
    expect(
      evaluateCondition(
        "genius",
        createContext({
          won: true,
          guesses: [
            { word: "SLATE", statuses: [] },
            { word: "APPLE", statuses: [] },
            { word: "BRICK", statuses: [] },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "genius",
        createContext({
          won: true,
          guesses: [
            { word: "SLATE", statuses: [] },
            { word: "APPLE", statuses: [] },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates unstoppable_streak", () => {
    expect(
      evaluateCondition(
        "unstoppable_streak",
        createContext({
          streak: 2,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "unstoppable_streak",
        createContext({
          streak: 3,
        }),
      ),
    ).toBe(true);
  });

  it("evaluates perfectionist", () => {
    expect(
      evaluateCondition(
        "perfectionist",
        createContext({
          won: true,
          guesses: [
            { word: "APPLE", statuses: [] },
            { word: "CRANE", statuses: [] },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "perfectionist",
        createContext({
          won: true,
          guesses: [{ word: "APPLE", statuses: [] }],
        }),
      ),
    ).toBe(true);
  });

  it("evaluates extreme_difficulty", () => {
    expect(
      evaluateCondition(
        "extreme_difficulty",
        createContext({
          won: true,
          difficulty: "normal",
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "extreme_difficulty",
        createContext({
          won: true,
          difficulty: "hard",
        }),
      ),
    ).toBe(true);
    expect(
      evaluateCondition(
        "extreme_difficulty",
        createContext({
          won: true,
          difficulty: "insane",
        }),
      ),
    ).toBe(true);
  });

  it("evaluates polyglot", () => {
    expect(
      evaluateCondition(
        "polyglot",
        createContext({
          won: true,
          dailyCompletedRounds: 1,
        }),
      ),
    ).toBe(false);
    expect(
      evaluateCondition(
        "polyglot",
        createContext({
          won: true,
          dailyCompletedRounds: 2,
        }),
      ),
    ).toBe(true);
  });
});
