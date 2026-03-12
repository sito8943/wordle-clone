import { checkGuess } from "../../utils/checker";
import { isValidWord } from "../../utils/words";
import { MAX_GUESSES, WORD_LENGTH } from "./constants";
import type {
  GuessResult,
  GuessValidationResult,
  PersistedGameState,
} from "./types";

export const hasAttemptedRow = (state: PersistedGameState): boolean =>
  state.guesses.length > 0;

export const createInitialGameState = (
  sessionId: string,
  answer: string,
): PersistedGameState => ({
  sessionId,
  answer,
  guesses: [],
  current: "",
  gameOver: false,
});

const isGuessResult = (value: unknown): value is GuessResult => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeGuess = value as Partial<GuessResult>;

  return (
    typeof maybeGuess.word === "string" &&
    Array.isArray(maybeGuess.statuses) &&
    maybeGuess.statuses.length === WORD_LENGTH &&
    maybeGuess.statuses.every(
      (status) =>
        status === "correct" || status === "present" || status === "absent",
    )
  );
};

export const normalizePersistedGameState = (
  value: unknown,
  sessionId: string,
  initialAnswer: string,
): PersistedGameState => {
  if (value && typeof value === "object") {
    const maybe = value as Partial<PersistedGameState>;

    if (
      typeof maybe.answer === "string" &&
      Array.isArray(maybe.guesses) &&
      typeof maybe.current === "string" &&
      typeof maybe.gameOver === "boolean" &&
      maybe.guesses.every(isGuessResult)
    ) {
      const normalized: PersistedGameState = {
        sessionId:
          typeof maybe.sessionId === "string" ? maybe.sessionId : sessionId,
        answer: maybe.answer,
        guesses: maybe.guesses,
        current: maybe.current,
        gameOver: maybe.gameOver,
      };

      if (!hasAttemptedRow(normalized)) {
        return createInitialGameState(sessionId, initialAnswer);
      }

      return normalized;
    }
  }

  return createInitialGameState(sessionId, initialAnswer);
};

export const shouldAskToResume = (
  state: PersistedGameState,
  currentSessionId: string,
): boolean =>
  state.sessionId !== currentSessionId &&
  !state.gameOver &&
  hasAttemptedRow(state);

export const isWon = (state: PersistedGameState): boolean =>
  state.guesses.some((guess) => guess.word === state.answer);

export const validateGuessInput = (
  input: string,
  answer: string,
): GuessValidationResult => {
  if (input.length < WORD_LENGTH) {
    return { ok: false, message: "Not enough letters" };
  }

  if (!isValidWord(input)) {
    return { ok: false, message: "Not in word list" };
  }

  return {
    ok: true,
    guess: { word: input, statuses: checkGuess(input, answer) },
  };
};

export const applyGuess = (
  state: PersistedGameState,
  guess: GuessResult,
): PersistedGameState => {
  const nextGuesses = [...state.guesses, guess];

  return {
    ...state,
    guesses: nextGuesses,
    current: "",
    gameOver: guess.word === state.answer || nextGuesses.length === MAX_GUESSES,
  };
};

export const addLetter = (
  state: PersistedGameState,
  letter: string,
): PersistedGameState => {
  if (state.current.length >= WORD_LENGTH) {
    return state;
  }

  return { ...state, current: state.current + letter };
};

export const removeLetter = (
  state: PersistedGameState,
): PersistedGameState => ({
  ...state,
  current: state.current.slice(0, -1),
});

export const isLetterKey = (key: string): boolean => /^[A-Z]$/.test(key);
