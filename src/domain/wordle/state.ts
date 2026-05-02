import { checkGuess } from "@utils/checker";
import { isValidWord } from "@utils/words";
import {
  createGameReferenceForAnswer,
  normalizeSeed,
  resolveAnswerFromGameReference,
} from "./reference";
import { resolveBoardRoundConfig } from "./roundConfig";
import type { PlayerLanguage } from "./player";
import type {
  BoardRoundConfig,
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
  const now = Date.now();

  return {
    sessionId,
    gameId: reference.gameId,
    seed: reference.seed,
    startedAt: now,
    answer,
    guesses: [],
    current: "",
    gameOver: false,
  };
};

const normalizeRoundStartedAt = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return Date.now();
  }

  return Math.floor(value);
};

const isGuessResult = (
  value: unknown,
  lettersPerRow: number,
): value is GuessResult => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeGuess = value as Partial<GuessResult>;

  return (
    typeof maybeGuess.word === "string" &&
    Array.isArray(maybeGuess.statuses) &&
    maybeGuess.statuses.length === lettersPerRow &&
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
  roundConfig?: Partial<BoardRoundConfig>,
): PersistedGameState => {
  const { lettersPerRow } = resolveBoardRoundConfig(roundConfig);

  if (value && typeof value === "object") {
    const maybe = value as Partial<PersistedGameState & PersistedGameRef>;

    if (
      typeof maybe.gameId === "string" &&
      typeof maybe.seed === "number" &&
      Array.isArray(maybe.guesses) &&
      typeof maybe.current === "string" &&
      typeof maybe.gameOver === "boolean" &&
      maybe.guesses.every((guess) => isGuessResult(guess, lettersPerRow))
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
        startedAt: normalizeRoundStartedAt(maybe.startedAt),
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
      maybe.guesses.every((guess) => isGuessResult(guess, lettersPerRow))
    ) {
      const reference = createGameReferenceForAnswer(maybe.answer, words, {
        deterministic: true,
      });
      const normalized: PersistedGameState = {
        sessionId:
          typeof maybe.sessionId === "string" ? maybe.sessionId : sessionId,
        gameId: reference.gameId,
        seed: reference.seed,
        startedAt: normalizeRoundStartedAt(maybe.startedAt),
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
  options: {
    allowUnknownWords?: boolean;
    roundConfig?: Partial<BoardRoundConfig>;
  } = {},
): GuessValidationResult => {
  const { lettersPerRow } = resolveBoardRoundConfig(options.roundConfig);

  if (input.length < lettersPerRow || input.includes(" ")) {
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
  roundConfig?: Partial<BoardRoundConfig>,
): PersistedGameState => {
  const { maxGuesses } = resolveBoardRoundConfig(roundConfig);
  const nextGuesses = [...state.guesses, guess];

  return {
    ...state,
    guesses: nextGuesses,
    current: "",
    gameOver: guess.word === state.answer || nextGuesses.length === maxGuesses,
  };
};

export const addLetter = (
  state: PersistedGameState,
  letter: string,
  roundConfig?: Partial<BoardRoundConfig>,
): PersistedGameState => {
  const { lettersPerRow } = resolveBoardRoundConfig(roundConfig);

  if (state.current.length >= lettersPerRow) {
    return state;
  }

  return { ...state, current: state.current + letter };
};

export const setLetterAt = (
  state: PersistedGameState,
  index: number,
  letter: string,
  roundConfig?: Partial<BoardRoundConfig>,
): PersistedGameState => {
  const { lettersPerRow } = resolveBoardRoundConfig(roundConfig);

  if (index < 0 || index >= lettersPerRow) {
    return state;
  }

  const padded = state.current.padEnd(index + 1, " ");
  return {
    ...state,
    current: padded.slice(0, index) + letter + padded.slice(index + 1),
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

  const letterAtIndex = state.current[index];
  if (!letterAtIndex || letterAtIndex.trim() === "") {
    return state;
  }

  const nextCurrent =
    (state.current.slice(0, index) + " " + state.current.slice(index + 1))
      .trimEnd();

  return {
    ...state,
    current: nextCurrent,
  };
};

export const isLetterKey = (
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: PlayerLanguage = "es",
): boolean => /^[A-ZÑ]$/.test(key);
