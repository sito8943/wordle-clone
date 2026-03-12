import { useState, useEffect, useCallback, useMemo } from "react";
import { checkGuess } from "../utils/checker";
import { env } from "../config/env";
import { getRandomWord, isValidWord } from "../utils/words";
import type { GuessResult } from "./types";
import useLocalStorage from "./useLocalStorage";

type PersistedGameState = {
  sessionId: string;
  answer: string;
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
};

const WORDLE_SESSION_STORAGE_KEY = "wordle:session-id";
const WORD_LENGTH = 5;

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
      return {
        sessionId:
          typeof maybe.sessionId === "string" ? maybe.sessionId : sessionId,
        answer: maybe.answer,
        guesses: maybe.guesses,
        current: maybe.current,
        gameOver: maybe.gameOver,
      };
    }
  }

  return createInitialGameState(sessionId);
};

const hasActiveProgress = (state: PersistedGameState): boolean =>
  !state.gameOver && (state.guesses.length > 0 || state.current.length > 0);

const shouldAskToResume = (
  state: PersistedGameState,
  currentSessionId: string,
): boolean => state.sessionId !== currentSessionId && hasActiveProgress(state);

const isSameState = (a: PersistedGameState, b: PersistedGameState): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export default function useWordle() {
  const currentSessionId = useMemo(getOrCreateSessionId, []);

  const [storedGameState, setStoredGameState] =
    useLocalStorage<PersistedGameState>(env.wordleGameStorageKey, () =>
      createInitialGameState(currentSessionId),
    );

  const [message, setMessage] = useState("");

  const gameState = useMemo(
    () => normalizePersistedGameState(storedGameState, currentSessionId),
    [storedGameState, currentSessionId],
  );

  const [showResumeDialog, setShowResumeDialog] = useState(() =>
    shouldAskToResume(gameState, currentSessionId),
  );

  const { answer, guesses, current, gameOver } = gameState;

  useEffect(() => {
    if (!isSameState(storedGameState, gameState)) {
      setStoredGameState(gameState);
    }
  }, [storedGameState, gameState, setStoredGameState]);

  useEffect(() => {
    if (shouldAskToResume(gameState, currentSessionId)) {
      setShowResumeDialog(true);
    }
  }, [gameState, currentSessionId]);

  // pure computation of whether the answer has been guessed
  const won = useMemo(
    () => guesses.some((g) => g.word === answer),
    [guesses, answer],
  );

  const showMessage = (msg: string) => {
    setMessage(msg);
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

      setStoredGameState((prev) => {
        const base = normalizePersistedGameState(prev, currentSessionId);
        const nextGuesses = [...base.guesses, result];

        return {
          ...base,
          guesses: nextGuesses,
          current: "",
          gameOver: input === base.answer || nextGuesses.length === 6,
        };
      });

      return;
    },
    [answer, setStoredGameState, currentSessionId],
  );

  const removeLetter = useCallback(() => {
    setStoredGameState((prev) => {
      const base = normalizePersistedGameState(prev, currentSessionId);
      return { ...base, current: base.current.slice(0, -1) };
    });
  }, [setStoredGameState, currentSessionId]);

  const addLetter = useCallback(
    (letter: string) => {
      setStoredGameState((prev) => {
        const base = normalizePersistedGameState(prev, currentSessionId);
        if (base.current.length >= WORD_LENGTH) {
          return base;
        }

        return { ...base, current: base.current + letter };
      });
    },
    [setStoredGameState, currentSessionId],
  );

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
    setStoredGameState((prev) => {
      const base = normalizePersistedGameState(prev, currentSessionId);
      return { ...base, sessionId: currentSessionId };
    });
    setShowResumeDialog(false);
  }, [setStoredGameState, currentSessionId]);

  const startNewBoard = useCallback(() => {
    setStoredGameState(createInitialGameState(currentSessionId));
    setShowResumeDialog(false);
    setMessage("");
  }, [setStoredGameState, currentSessionId]);

  const refresh = useCallback(() => {
    setStoredGameState(createInitialGameState(currentSessionId));
    setShowResumeDialog(false);
    setMessage("");
  }, [setStoredGameState, currentSessionId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key === "Backspace" ? "BACKSPACE" : e.key.toUpperCase());
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
