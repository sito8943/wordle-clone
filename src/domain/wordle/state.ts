import { checkGuess } from "@utils/checker";
import { isValidWord } from "@utils/words";
import { MAX_GUESSES, WORD_LENGTH } from "./constants";
import {
  createGameReferenceForAnswer,
  normalizeSeed,
  resolveAnswerFromGameReference,
} from "./reference";
import type {
  GuessResult,
  GuessValidationResult,
  PersistedGameRef,
  PersistedGameState,
} from "./types";

export const hasAttemptedRow = (state: PersistedGameState): boolean =>
  state.guesses.length > 0;

export const hasInProgressGame = (state: PersistedGameState): boolean =>
  state.guesses.length > 0 || state.current.length > 0;

export const createInitialGameState = (
  sessionId: string,
  answer: string,
): PersistedGameState => {
  const reference = createGameReferenceForAnswer(answer);

  return {
    sessionId,
    gameId: reference.gameId,
    seed: reference.seed,
    answer,
    guesses: [],
    current: "",
    gameOver: false,
  };
};

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
  words: string[] = [],
): PersistedGameState => {
  if (value && typeof value === "object") {
    const maybe = value as Partial<PersistedGameState & PersistedGameRef>;

    if (
      typeof maybe.gameId === "string" &&
      typeof maybe.seed === "number" &&
      Array.isArray(maybe.guesses) &&
      typeof maybe.current === "string" &&
      typeof maybe.gameOver === "boolean" &&
      maybe.guesses.every(isGuessResult)
    ) {
      const answer = resolveAnswerFromGameReference(
        {
          gameId: maybe.gameId,
          seed: normalizeSeed(maybe.seed),
        },
        words,
      );

      const normalized: PersistedGameState = {
        sessionId:
          typeof maybe.sessionId === "string" ? maybe.sessionId : sessionId,
        gameId: maybe.gameId,
        seed: normalizeSeed(maybe.seed),
        answer: answer ?? initialAnswer,
        guesses: maybe.guesses,
        current: maybe.current,
        gameOver: maybe.gameOver,
      };

      if (!hasInProgressGame(normalized)) {
        return createInitialGameState(sessionId, initialAnswer);
      }

      return normalized;
    }

    if (
      typeof maybe.answer === "string" &&
      Array.isArray(maybe.guesses) &&
      typeof maybe.current === "string" &&
      typeof maybe.gameOver === "boolean" &&
      maybe.guesses.every(isGuessResult)
    ) {
      const reference = createGameReferenceForAnswer(maybe.answer, words, {
        deterministic: true,
      });
      const normalized: PersistedGameState = {
        sessionId:
          typeof maybe.sessionId === "string" ? maybe.sessionId : sessionId,
        gameId: reference.gameId,
        seed: reference.seed,
        answer: maybe.answer,
        guesses: maybe.guesses,
        current: maybe.current,
        gameOver: maybe.gameOver,
      };

      if (!hasInProgressGame(normalized)) {
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
  hasInProgressGame(state);

export const isWon = (state: PersistedGameState): boolean =>
  state.guesses.some((guess) => guess.word === state.answer);

export const validateGuessInput = (
  input: string,
  answer: string,
  options: { allowUnknownWords?: boolean } = {},
): GuessValidationResult => {
  if (input.length < WORD_LENGTH) {
    return { ok: false, message: "Not enough letters" };
  }

  if (!options.allowUnknownWords && !isValidWord(input)) {
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

export const setLetterAt = (
  state: PersistedGameState,
  index: number,
  letter: string,
): PersistedGameState => {
  if (index < 0 || index > state.current.length || index >= WORD_LENGTH) {
    return state;
  }

  if (index === state.current.length) {
    return addLetter(state, letter);
  }

  return {
    ...state,
    current:
      state.current.slice(0, index) + letter + state.current.slice(index + 1),
  };
};

export const removeLetter = (
  state: PersistedGameState,
): PersistedGameState => ({
  ...state,
  current: state.current.slice(0, -1),
});

export const removeLetterAt = (
  state: PersistedGameState,
  index: number,
): PersistedGameState => {
  if (index < 0 || index >= state.current.length) {
    return state;
  }

  return {
    ...state,
    current: state.current.slice(0, index) + state.current.slice(index + 1),
  };
};

export const isLetterKey = (key: string): boolean => /^[A-Z]$/.test(key);
