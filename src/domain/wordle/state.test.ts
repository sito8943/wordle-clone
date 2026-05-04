import { describe, expect, it } from "vitest";
import {
  addLetter,
  applyGuess,
  createInitialGameState,
  hasAttemptedRow,
  hasInProgressGame,
  isLetterKey,
  isWon,
  normalizePersistedGameState,
  removeLetter,
  removeLetterAt,
  setLetterAt,
  shouldAskToResume,
  validateGuessInput,
} from "./state";
import { createGameReferenceForAnswer } from "./reference";
import type { PersistedGameState } from "./types";

const SESSION_ID = "test-session-id";
const ANSWER = "CRANE";

const makeState = (
  overrides: Partial<PersistedGameState> = {},
): PersistedGameState => ({
  ...createInitialGameState(SESSION_ID, ANSWER),
  ...overrides,
});

describe("createInitialGameState", () => {
  it("creates state with empty guesses and current input", () => {
    const state = createInitialGameState(SESSION_ID, ANSWER);
    expect(state.sessionId).toBe(SESSION_ID);
    expect(state.answer).toBe(ANSWER);
    expect(state.guesses).toEqual([]);
    expect(state.current).toBe("");
    expect(state.gameOver).toBe(false);
  });
});

describe("hasAttemptedRow", () => {
  it("returns false when no guesses have been made", () => {
    expect(hasAttemptedRow(makeState())).toBe(false);
  });

  it("returns true when at least one guess has been made", () => {
    const state = makeState({
      guesses: [
        {
          word: "ABOUT",
          statuses: ["absent", "absent", "absent", "absent", "absent"],
        },
      ],
    });
    expect(hasAttemptedRow(state)).toBe(true);
  });
});

describe("hasInProgressGame", () => {
  it("returns false when guesses and current are empty", () => {
    expect(hasInProgressGame(makeState())).toBe(false);
  });

  it("returns true when there are guesses", () => {
    const state = makeState({
      guesses: [
        {
          word: "ABOUT",
          statuses: ["absent", "absent", "absent", "absent", "absent"],
        },
      ],
    });
    expect(hasInProgressGame(state)).toBe(true);
  });

  it("returns true when current input is non-empty", () => {
    expect(hasInProgressGame(makeState({ current: "CR" }))).toBe(true);
  });
});

describe("isWon", () => {
  it("returns false when no guesses match the answer", () => {
    const state = makeState({
      guesses: [
        {
          word: "ABOUT",
          statuses: ["absent", "absent", "absent", "absent", "absent"],
        },
      ],
    });
    expect(isWon(state)).toBe(false);
  });

  it("returns true when a guess matches the answer", () => {
    const state = makeState({
      answer: "CRANE",
      guesses: [
        {
          word: "CRANE",
          statuses: ["correct", "correct", "correct", "correct", "correct"],
        },
      ],
    });
    expect(isWon(state)).toBe(true);
  });
});

describe("shouldAskToResume", () => {
  it("returns false when session IDs match", () => {
    const state = makeState({
      current: "CR",
      sessionId: SESSION_ID,
    });
    expect(shouldAskToResume(state, SESSION_ID)).toBe(false);
  });

  it("returns false when game is over", () => {
    const state = makeState({
      sessionId: "other-session",
      gameOver: true,
      guesses: [
        {
          word: "CRANE",
          statuses: ["correct", "correct", "correct", "correct", "correct"],
        },
      ],
    });
    expect(shouldAskToResume(state, SESSION_ID)).toBe(false);
  });

  it("returns false when there is no in-progress game", () => {
    const state = makeState({ sessionId: "other-session" });
    expect(shouldAskToResume(state, SESSION_ID)).toBe(false);
  });

  it("returns true when session differs and there is an in-progress game", () => {
    const state = makeState({
      sessionId: "other-session",
      current: "CR",
    });
    expect(shouldAskToResume(state, SESSION_ID)).toBe(true);
  });
});

describe("addLetter", () => {
  it("appends a letter to current input", () => {
    const next = addLetter(makeState({ current: "CR" }), "A");
    expect(next.current).toBe("CRA");
  });

  it("does not exceed WORD_LENGTH (5 letters)", () => {
    const state = makeState({ current: "CRANE" });
    const next = addLetter(state, "X");
    expect(next.current).toBe("CRANE");
  });

  it("does not mutate original state", () => {
    const state = makeState({ current: "CR" });
    addLetter(state, "A");
    expect(state.current).toBe("CR");
  });

  it("respects custom letters-per-row limits", () => {
    const state = makeState({ current: "ABC" });
    const next = addLetter(state, "D", { lettersPerRow: 3, maxGuesses: 6 });
    expect(next.current).toBe("ABC");
  });
});

describe("removeLetter", () => {
  it("removes the last letter from current input", () => {
    const next = removeLetter(makeState({ current: "CRA" }));
    expect(next.current).toBe("CR");
  });

  it("returns empty string when current is already empty", () => {
    const next = removeLetter(makeState({ current: "" }));
    expect(next.current).toBe("");
  });

  it("does not mutate original state", () => {
    const state = makeState({ current: "CRA" });
    removeLetter(state);
    expect(state.current).toBe("CRA");
  });
});

describe("setLetterAt", () => {
  it("replaces an existing letter at the provided index", () => {
    const next = setLetterAt(makeState({ current: "CRANE" }), 1, "L");
    expect(next.current).toBe("CLANE");
  });

  it("appends when index points to the next empty cell", () => {
    const next = setLetterAt(makeState({ current: "CRA" }), 3, "N");
    expect(next.current).toBe("CRAN");
  });

  it("allows setting a letter beyond current length with gap padding", () => {
    const next = setLetterAt(makeState({ current: "CRA" }), 4, "Z");
    expect(next.current).toBe("CRA Z");
  });

  it("ignores out-of-range indexes", () => {
    const state = makeState({ current: "CRA" });
    expect(setLetterAt(state, -1, "Z").current).toBe("CRA");
    expect(setLetterAt(state, 5, "Z").current).toBe("CRA");
  });

  it("ignores indexes outside a custom letters-per-row limit", () => {
    const state = makeState({ current: "ABC" });
    const next = setLetterAt(state, 3, "Z", {
      lettersPerRow: 3,
      maxGuesses: 6,
    });
    expect(next.current).toBe("ABC");
  });
});

describe("removeLetterAt", () => {
  it("clears the letter at the provided index without shifting others", () => {
    const next = removeLetterAt(makeState({ current: "CRANE" }), 2);
    expect(next.current).toBe("CR NE");
  });

  it("trims trailing empty cells after clearing the last letter", () => {
    const next = removeLetterAt(makeState({ current: "CRA" }), 2);
    expect(next.current).toBe("CR");
  });

  it("does nothing when the selected cell is already empty", () => {
    const state = makeState({ current: "C A" });
    const next = removeLetterAt(state, 1);
    expect(next.current).toBe("C A");
  });

  it("ignores out-of-range indexes", () => {
    const state = makeState({ current: "CRA" });
    expect(removeLetterAt(state, -1).current).toBe("CRA");
    expect(removeLetterAt(state, 3).current).toBe("CRA");
  });
});

describe("applyGuess", () => {
  it("adds the guess to the guesses array and clears current", () => {
    const state = makeState({ current: "CRANE" });
    const guess = {
      word: "CRANE",
      statuses: [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ] as PersistedGameState["guesses"][0]["statuses"],
    };
    const next = applyGuess(state, guess);

    expect(next.guesses).toHaveLength(1);
    expect(next.guesses[0]).toBe(guess);
    expect(next.current).toBe("");
  });

  it("sets gameOver to true when guess matches the answer", () => {
    const state = makeState({ answer: "CRANE" });
    const guess = {
      word: "CRANE",
      statuses: [
        "correct",
        "correct",
        "correct",
        "correct",
        "correct",
      ] as PersistedGameState["guesses"][0]["statuses"],
    };
    const next = applyGuess(state, guess);
    expect(next.gameOver).toBe(true);
  });

  it("sets gameOver to true when max guesses are reached", () => {
    const wrongGuess = {
      word: "ABOUT",
      statuses: [
        "absent",
        "absent",
        "absent",
        "absent",
        "absent",
      ] as PersistedGameState["guesses"][0]["statuses"],
    };
    const state = makeState({
      guesses: Array(5).fill(wrongGuess),
    });
    const next = applyGuess(state, wrongGuess);
    expect(next.gameOver).toBe(true);
  });

  it("does not set gameOver when there are remaining guesses and no win", () => {
    const state = makeState();
    const guess = {
      word: "ABOUT",
      statuses: [
        "absent",
        "absent",
        "absent",
        "absent",
        "absent",
      ] as PersistedGameState["guesses"][0]["statuses"],
    };
    const next = applyGuess(state, guess);
    expect(next.gameOver).toBe(false);
  });

  it("respects custom max-guesses limits", () => {
    const wrongGuess = {
      word: "ABOUT",
      statuses: [
        "absent",
        "absent",
        "absent",
        "absent",
        "absent",
      ] as PersistedGameState["guesses"][0]["statuses"],
    };
    const state = makeState({
      guesses: Array(2).fill(wrongGuess),
    });
    const next = applyGuess(state, wrongGuess, {
      lettersPerRow: 5,
      maxGuesses: 3,
    });
    expect(next.gameOver).toBe(true);
  });
});

describe("validateGuessInput", () => {
  it("returns error when input is too short", () => {
    const result = validateGuessInput("CR", "CRANE");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Not enough letters");
    }
  });

  it("returns success with guess result for valid word", () => {
    const result = validateGuessInput("CRANE", "CRANE", {
      allowUnknownWords: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.guess.word).toBe("CRANE");
      expect(result.guess.statuses).toHaveLength(5);
    }
  });

  it("allows unknown words when allowUnknownWords is true", () => {
    const result = validateGuessInput("ZZZZZ", "CRANE", {
      allowUnknownWords: true,
    });
    expect(result.ok).toBe(true);
  });

  it("uses custom letters-per-row during validation", () => {
    const result = validateGuessInput("APPLE", "ORANGE", {
      allowUnknownWords: true,
      roundConfig: {
        lettersPerRow: 6,
        maxGuesses: 6,
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Not enough letters");
    }
  });
});

describe("isLetterKey", () => {
  it("returns true for single uppercase letters in default layout", () => {
    expect(isLetterKey("A")).toBe(true);
    expect(isLetterKey("Z")).toBe(true);
    expect(isLetterKey("Ñ")).toBe(true);
  });

  it("accepts Ñ regardless of selected interface language", () => {
    expect(isLetterKey("Ñ", "es")).toBe(true);
    expect(isLetterKey("Ñ", "en")).toBe(true);
    expect(isLetterKey("N", "es")).toBe(true);
    expect(isLetterKey("ñ", "es")).toBe(false);
  });

  it("returns false for lowercase letters", () => {
    expect(isLetterKey("a")).toBe(false);
  });

  it("returns false for special keys", () => {
    expect(isLetterKey("Enter")).toBe(false);
    expect(isLetterKey("Backspace")).toBe(false);
  });

  it("returns false for multi-character strings", () => {
    expect(isLetterKey("AB")).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(isLetterKey("1")).toBe(false);
  });
});

describe("normalizePersistedGameState", () => {
  it("returns initial state for null input", () => {
    const state = normalizePersistedGameState(null, SESSION_ID, ANSWER);
    expect(state).toMatchObject({
      sessionId: SESSION_ID,
      answer: ANSWER,
      guesses: [],
      current: "",
      gameOver: false,
    });
  });

  it("returns initial state for invalid object shape", () => {
    const state = normalizePersistedGameState(
      { foo: "bar" },
      SESSION_ID,
      ANSWER,
    );
    expect(state).toMatchObject({
      sessionId: SESSION_ID,
      answer: ANSWER,
      guesses: [],
      current: "",
      gameOver: false,
    });
  });

  it("returns normalized state for valid persisted data", () => {
    const reference = createGameReferenceForAnswer("STONE", ["crane", "stone"]);
    const valid: PersistedGameState = {
      sessionId: "stored-session",
      gameId: reference.gameId,
      seed: reference.seed,
      startedAt: 1_700_000_000_000,
      answer: "STONE",
      guesses: [
        {
          word: "CRANE",
          statuses: ["absent", "present", "correct", "absent", "absent"],
        },
      ],
      current: "AB",
      gameOver: false,
    };
    const state = normalizePersistedGameState(valid, SESSION_ID, ANSWER, [
      "crane",
      "stone",
    ]);
    expect(state.answer).toBe("STONE");
    expect(state.guesses).toHaveLength(1);
    expect(state.current).toBe("AB");
  });

  it("returns initial state when persisted game has no in-progress state", () => {
    const empty: PersistedGameState = createInitialGameState(
      SESSION_ID,
      "STONE",
    );
    const state = normalizePersistedGameState(empty, SESSION_ID, ANSWER, [
      "crane",
      "stone",
    ]);
    expect(state).toMatchObject({
      sessionId: SESSION_ID,
      answer: ANSWER,
      guesses: [],
      current: "",
      gameOver: false,
    });
  });

  it("falls back to provided sessionId when stored sessionId is missing", () => {
    const valid = {
      ...createInitialGameState(SESSION_ID, "STONE"),
      sessionId: undefined,
      answer: "STONE",
      guesses: [
        {
          word: "CRANE",
          statuses: ["absent", "present", "correct", "absent", "absent"],
        },
      ],
      current: "AB",
      gameOver: false,
    };
    const state = normalizePersistedGameState(valid, SESSION_ID, ANSWER, [
      "crane",
      "stone",
    ]);
    expect(state.sessionId).toBe(SESSION_ID);
  });

  it("accepts persisted guess status length based on custom round config", () => {
    const valid = {
      sessionId: "stored-session",
      gameId: "game-1",
      seed: 1,
      startedAt: 1_700_000_000_000,
      answer: "PLAY",
      guesses: [
        {
          word: "PLAN",
          statuses: ["correct", "absent", "present", "absent"],
        },
      ],
      current: "",
      gameOver: false,
    };

    const state = normalizePersistedGameState(valid, SESSION_ID, "PLAY", [], {
      lettersPerRow: 4,
      maxGuesses: 8,
    });

    expect(state.guesses).toHaveLength(1);
    expect(state.guesses[0].statuses).toEqual([
      "correct",
      "absent",
      "present",
      "absent",
    ]);
  });
});
