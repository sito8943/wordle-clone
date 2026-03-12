import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addLetter,
  applyGuess,
  createInitialGameState,
  getOrCreateSessionId,
  isLetterKey,
  isWon,
  normalizePersistedGameState,
  persistGameState,
  readPersistedGameState,
  removeLetter,
  shouldAskToResume,
  validateGuessInput,
  WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
  WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY,
  WORDLE_START_ANIMATION_SESSION_KEY,
} from "../domain/wordle";
import { getRandomWord } from "../utils/words";
import useLocalStorage from "./useLocalStorage";

const hasSeenStartAnimationInSession = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  return sessionStorage.getItem(WORDLE_START_ANIMATION_SESSION_KEY) === "seen";
};

const markStartAnimationAsSeen = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WORDLE_START_ANIMATION_SESSION_KEY, "seen");
};

const shouldAnimateOnFirstSessionView = (
  animationsDisabled: boolean,
): boolean => {
  if (animationsDisabled || hasSeenStartAnimationInSession()) {
    return false;
  }

  markStartAnimationAsSeen();
  return true;
};

const hasSeenKeyboardAnimationInSession = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    sessionStorage.getItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY) ===
    "seen"
  );
};

const markKeyboardAnimationAsSeen = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY, "seen");
};

const shouldAnimateKeyboardEntryOnSession = (
  animationsDisabled: boolean,
): boolean => {
  if (animationsDisabled || hasSeenKeyboardAnimationInSession()) {
    return false;
  }

  markKeyboardAnimationAsSeen();
  return true;
};

export default function useWordle() {
  const currentSessionId = useMemo(getOrCreateSessionId, []);
  const initialAnswer = useMemo(getRandomWord, []);
  const [animationsDisabled] = useLocalStorage<boolean>(
    WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY,
    false,
  );
  const [startAnimationSeed, setStartAnimationSeed] = useState(() =>
    shouldAnimateOnFirstSessionView(animationsDisabled) ? 1 : 0,
  );
  const [keyboardEntryAnimationEnabled] = useState(() =>
    shouldAnimateKeyboardEntryOnSession(animationsDisabled),
  );

  const [gameState, setGameState] = useState(() =>
    normalizePersistedGameState(
      readPersistedGameState(),
      currentSessionId,
      initialAnswer,
    ),
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

  const won = useMemo(() => isWon(gameState), [gameState]);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1800);
  }, []);

  const checkInput = useCallback(
    (input: string) => {
      const validation = validateGuessInput(input, answer);

      if (!validation.ok) {
        showMessage(validation.message);
        return;
      }

      setGameState((prev) => applyGuess(prev, validation.guess));
    },
    [answer, showMessage],
  );

  const removeCurrentLetter = useCallback(() => {
    setGameState((prev) => removeLetter(prev));
  }, []);

  const addCurrentLetter = useCallback((letter: string) => {
    setGameState((prev) => addLetter(prev, letter));
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver || showResumeDialog) {
        return;
      }

      if (key === "ENTER") {
        checkInput(current);
        return;
      }

      if (key === "BACKSPACE") {
        removeCurrentLetter();
        return;
      }

      if (isLetterKey(key)) {
        addCurrentLetter(key);
      }
    },
    [
      addCurrentLetter,
      checkInput,
      current,
      gameOver,
      removeCurrentLetter,
      showResumeDialog,
    ],
  );

  const continuePreviousBoard = useCallback(() => {
    setGameState((prev) => ({ ...prev, sessionId: currentSessionId }));
    setShowResumeDialog(false);
  }, [currentSessionId]);

  const triggerStartAnimation = useCallback(() => {
    if (animationsDisabled) {
      return;
    }

    markStartAnimationAsSeen();
    setStartAnimationSeed((prev) => prev + 1);
  }, [animationsDisabled]);

  const resetBoard = useCallback(() => {
    setGameState(createInitialGameState(currentSessionId, getRandomWord()));
    setShowResumeDialog(false);
    setMessage("");
    triggerStartAnimation();
  }, [currentSessionId, triggerStartAnimation]);

  const startNewBoard = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const refresh = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

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
    startAnimationSeed,
    startAnimationsEnabled: !animationsDisabled,
    keyboardEntryAnimationEnabled,
    showResumeDialog,
    continuePreviousBoard,
    startNewBoard,
  };
}
