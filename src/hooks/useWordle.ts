import { useState, useEffect, useCallback, useMemo } from "react";
import { checkGuess } from "../utils/checker";
import { env } from "../config/env";
import { getRandomWord, isValidWord } from "../utils/words";
import type { GuessResult } from "./types";

type PersistedGameState = {
  sessionId: string;
  answer: string;
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
};

const WORDLE_SESSION_STORAGE_KEY = "wordle:session-id";
const WORD_LENGTH = 5;

const hasAttemptedRow = (state: PersistedGameState): boolean =>
  state.guesses.length > 0;

const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getOrCreateSessionId = (): string => {
  const existing = sessionStorage.getItem(WORDLE_SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createSessionId();
  sessionStorage.setItem(WORDLE_SESSION_STORAGE_KEY, created);
  return created;
};

const createInitialGameState = (sessionId: string): PersistedGameState => ({
  sessionId,
  answer: getRandomWord(),
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

const normalizePersistedGameState = (
  value: unknown,
  sessionId: string,
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

      // Ignore old/incomplete persisted states with no attempted row.
      if (!hasAttemptedRow(normalized)) {
        return createInitialGameState(sessionId);
      }

      return normalized;
    }
  }

  return createInitialGameState(sessionId);
};

const readPersistedGameState = (): unknown => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(env.wordleGameStorageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistGameState = (state: PersistedGameState): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (hasAttemptedRow(state)) {
      localStorage.setItem(env.wordleGameStorageKey, JSON.stringify(state));
      return;
    }

    localStorage.removeItem(env.wordleGameStorageKey);
  } catch {
    // Ignore localStorage write errors.
  }
};

const shouldAskToResume = (
  state: PersistedGameState,
  currentSessionId: string,
): boolean =>
  state.sessionId !== currentSessionId &&
  !state.gameOver &&
  hasAttemptedRow(state);

export default function useWordle() {
  const currentSessionId = useMemo(getOrCreateSessionId, []);

  const [gameState, setGameState] = useState<PersistedGameState>(() =>
    normalizePersistedGameState(readPersistedGameState(), currentSessionId),
  );

  const [message, setMessage] = useState("");
  const [showResumeDialog, setShowResumeDialog] = useState(() =>
    shouldAskToResume(gameState, currentSessionId),
  );

  const { answer, guesses, current, gameOver } = gameState;

  useEffect(() => {
    persistGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    if (shouldAskToResume(gameState, currentSessionId)) {
      setShowResumeDialog(true);
    }
  }, [gameState, currentSessionId]);

  // pure computation of whether the answer has been guessed
  const won = useMemo(
    () => guesses.some((guess) => guess.word === answer),
    [guesses, answer],
  );

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1800);
  };

  const checkInput = useCallback(
    (input: string) => {
      if (input.length < WORD_LENGTH) {
        showMessage("Not enough letters");
        return false;
      }

      if (!isValidWord(input)) {
        showMessage("Not in word list");
        return false;
      }

      const statuses = checkGuess(input, answer);
      const result: GuessResult = { word: input, statuses };

      setGameState((prev) => {
        const nextGuesses = [...prev.guesses, result];

        return {
          ...prev,
          guesses: nextGuesses,
          current: "",
          gameOver: input === prev.answer || nextGuesses.length === 6,
        };
      });

      return;
    },
    [answer],
  );

  const removeLetter = useCallback(() => {
    setGameState((prev) => ({ ...prev, current: prev.current.slice(0, -1) }));
  }, []);

  const addLetter = useCallback((letter: string) => {
    setGameState((prev) => {
      if (prev.current.length >= WORD_LENGTH) {
        return prev;
      }

      return { ...prev, current: prev.current + letter };
    });
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver || showResumeDialog) return;

      if (key === "ENTER") {
        return checkInput(current);
      }

      if (key === "BACKSPACE") {
        return removeLetter();
      }

      if (/^[A-Z]$/.test(key)) {
        return addLetter(key);
      }
    },
    [gameOver, showResumeDialog, current, checkInput, removeLetter, addLetter],
  );

  const continuePreviousBoard = useCallback(() => {
    setGameState((prev) => ({ ...prev, sessionId: currentSessionId }));
    setShowResumeDialog(false);
  }, [currentSessionId]);

  const startNewBoard = useCallback(() => {
    setGameState(createInitialGameState(currentSessionId));
    setShowResumeDialog(false);
    setMessage("");
  }, [currentSessionId]);

  const refresh = useCallback(() => {
    setGameState(createInitialGameState(currentSessionId));
    setShowResumeDialog(false);
    setMessage("");
  }, [currentSessionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      handleKey(
        event.key === "Backspace" ? "BACKSPACE" : event.key.toUpperCase(),
      );
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return {
    answer,
    guesses,
    current,
    gameOver,
    won,
    message,
    handleKey,
    refresh,
    showResumeDialog,
    continuePreviousBoard,
    startNewBoard,
  };
}
