import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addLetter,
  applyGuess,
  createInitialGameState,
  getOrCreateSessionId,
  hasAttemptedRow,
  isLetterKey,
  isWon,
  normalizePersistedGameState,
  persistGameState,
  readPersistedGameState,
  removeLetter,
  shouldAskToResume,
  validateGuessInput,
} from "../../domain/wordle";
import { WORDS_DEFAULT_LANGUAGE } from "../../api/words";
import { useApi } from "../../providers";
import {
  getRandomWord,
  isValidWord,
  loadWordDictionaryFromCache,
  setWordDictionary,
} from "../../utils/words";
import { useAnimationsPreference } from "../useAnimationsPreference";
import {
  markStartAnimationAsSeen,
  shouldAnimateKeyboardEntryOnSession,
  shouldAnimateOnFirstSessionView,
} from "./utils";

const isEditableKeyboardTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
};

export default function useWordle() {
  const { wordDictionaryClient } = useApi();
  const cachedWords = useMemo(
    () => loadWordDictionaryFromCache(WORDS_DEFAULT_LANGUAGE),
    [],
  );
  const currentSessionId = useMemo(getOrCreateSessionId, []);
  const initialAnswer = useMemo(getRandomWord, []);
  const initialGameState = useMemo(
    () =>
      normalizePersistedGameState(
        readPersistedGameState(),
        currentSessionId,
        initialAnswer,
      ),
    [currentSessionId, initialAnswer],
  );
  const { animationsDisabled } = useAnimationsPreference();
  const [startAnimationSeed, setStartAnimationSeed] = useState(() =>
    shouldAnimateOnFirstSessionView(
      animationsDisabled,
      hasAttemptedRow(initialGameState),
    )
      ? 1
      : 0,
  );
  const [keyboardEntryAnimationEnabled] = useState(() =>
    shouldAnimateKeyboardEntryOnSession(animationsDisabled),
  );
  const [dictionaryWords, setDictionaryWords] = useState(cachedWords);
  const [dictionaryLoading, setDictionaryLoading] = useState(
    cachedWords.length === 0,
  );
  const [dictionaryError, setDictionaryError] = useState<string | null>(null);

  const [gameState, setGameState] = useState(initialGameState);

  const [message, setMessage] = useState("");
  const [showResumeDialog, setShowResumeDialog] = useState(() =>
    shouldAskToResume(gameState, currentSessionId),
  );

  const { answer, guesses, current, gameOver } = gameState;

  useEffect(() => {
    let cancelled = false;

    const loadDictionary = async () => {
      try {
        const remoteWords = await wordDictionaryClient.loadWords(
          WORDS_DEFAULT_LANGUAGE,
        );

        if (cancelled) {
          return;
        }

        if (remoteWords.length > 0) {
          const normalizedWords = setWordDictionary(
            remoteWords,
            WORDS_DEFAULT_LANGUAGE,
          );
          setDictionaryWords(normalizedWords);
          setDictionaryError(null);
        } else {
          setDictionaryWords(cachedWords);
          if (cachedWords.length === 0) {
            setDictionaryError("Word list unavailable.");
          }
        }
      } catch {
        if (cancelled) {
          return;
        }

        setDictionaryWords(cachedWords);
        if (cachedWords.length === 0) {
          setDictionaryError("Word list unavailable.");
        }
      } finally {
        if (!cancelled) {
          setDictionaryLoading(false);
        }
      }
    };

    void loadDictionary();

    return () => {
      cancelled = true;
    };
  }, [cachedWords, wordDictionaryClient]);

  useEffect(() => {
    if (dictionaryLoading) {
      return;
    }

    if (dictionaryWords.length === 0) {
      return;
    }

    setGameState((previous) => {
      if (hasAttemptedRow(previous) || previous.current.length > 0) {
        return previous;
      }

      if (isValidWord(previous.answer)) {
        return previous;
      }

      return createInitialGameState(currentSessionId, getRandomWord());
    });
  }, [currentSessionId, dictionaryLoading, dictionaryWords]);

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
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }

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
    dictionaryWords,
    dictionaryLoading,
    dictionaryError,
  };
}
