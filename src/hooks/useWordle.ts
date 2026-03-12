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
} from "../domain/wordle";
import { getRandomWord } from "../utils/words";

export default function useWordle() {
  const currentSessionId = useMemo(getOrCreateSessionId, []);
  const initialAnswer = useMemo(getRandomWord, []);

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

  const resetBoard = useCallback(() => {
    setGameState(createInitialGameState(currentSessionId, getRandomWord()));
    setShowResumeDialog(false);
    setMessage("");
  }, [currentSessionId]);

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
    showResumeDialog,
    continuePreviousBoard,
    startNewBoard,
  };
}
