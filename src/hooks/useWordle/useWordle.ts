import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addLetter,
  applyGuess,
  createInitialGameState,
  getOrCreateSessionId,
  hasInProgressGame,
  isLetterKey,
  isWon,
  normalizePersistedGameState,
  persistGameState,
  readPersistedGameState,
  resolveAnswerFromGameReference,
  removeLetter,
  shouldAskToResume,
  type PersistedGameState,
  validateGuessInput,
  WORD_LENGTH,
} from "@domain/wordle";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import useDictionaryQuery from "../useDictionaryQuery";
import {
  getRandomWord,
  isValidWord,
  loadWordDictionaryFromCache,
  setWordDictionary,
} from "@utils/words";
import { useAnimationsPreference } from "../useAnimationsPreference";
import {
  MESSAGE_VISIBILITY_DURATION_MS,
  NO_PRESENT_HINT_AVAILABLE_MESSAGE,
  ROW_ALREADY_FULL_MESSAGE,
} from "./constants";
import type { HintTileStatus, UseWordleOptions } from "./types";
import {
  blurRefreshButtonIfFocused,
  getPresentHintLetter,
  isDirectGameKeyboardKey,
  isEditableKeyboardTarget,
  markStartAnimationAsSeen,
  shouldAnimateKeyboardEntryOnSession,
  shouldAnimateOnFirstSessionView,
} from "./utils";

export default function useWordle(options: UseWordleOptions = {}) {
  const { allowUnknownWords = false } = options;
  const cachedWords = useMemo(
    () => loadWordDictionaryFromCache(WORDS_DEFAULT_LANGUAGE),
    [],
  );
  const { data: dictionaryData, isLoading: dictionaryLoading } =
    useDictionaryQuery(WORDS_DEFAULT_LANGUAGE, cachedWords);

  const dictionaryWords = useMemo(
    () =>
      dictionaryData && dictionaryData.length > 0
        ? dictionaryData
        : cachedWords,
    [cachedWords, dictionaryData],
  );
  const dictionaryError = useMemo(
    () =>
      !dictionaryLoading && dictionaryWords.length === 0
        ? "Word list unavailable."
        : null,
    [dictionaryLoading, dictionaryWords.length],
  );
  const currentSessionId = useMemo(getOrCreateSessionId, []);
  const initialAnswer = useMemo(getRandomWord, []);
  const initialGameState = useMemo(
    () =>
      normalizePersistedGameState(
        readPersistedGameState(),
        currentSessionId,
        initialAnswer,
        cachedWords,
      ),
    [cachedWords, currentSessionId, initialAnswer],
  );
  const { animationsDisabled } = useAnimationsPreference();
  const [startAnimationSeed, setStartAnimationSeed] = useState(() =>
    shouldAnimateOnFirstSessionView(
      animationsDisabled,
      hasInProgressGame(initialGameState),
    )
      ? 1
      : 0,
  );
  const [keyboardEntryAnimationEnabled] = useState(() =>
    shouldAnimateKeyboardEntryOnSession(animationsDisabled),
  );

  const [gameState, setGameState] = useState(initialGameState);
  const [boardVersion, setBoardVersion] = useState(0);

  const [message, setMessage] = useState("");
  const [showResumeDialog, setShowResumeDialog] = useState(() =>
    shouldAskToResume(gameState, currentSessionId),
  );
  const [activeRowHintStatuses, setActiveRowHintStatuses] = useState<
    Record<number, HintTileStatus>
  >({});
  const [hintRevealPulse, setHintRevealPulse] = useState(0);
  const [hintRevealTileIndex, setHintRevealTileIndex] = useState<number | null>(
    null,
  );

  const { sessionId, gameId, answer, guesses, current, gameOver } = gameState;

  const setGameStateAndPersist = useCallback(
    (updater: (previous: PersistedGameState) => PersistedGameState) => {
      setGameState((previous) => {
        const next = updater(previous);
        persistGameState(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (dictionaryWords.length === 0) {
      return;
    }

    setWordDictionary(dictionaryWords, WORDS_DEFAULT_LANGUAGE);
  }, [dictionaryWords]);

  useEffect(() => {
    if (dictionaryLoading) {
      return;
    }

    if (dictionaryWords.length === 0) {
      return;
    }

    setGameState((previous) => {
      const resolvedAnswer = resolveAnswerFromGameReference(
        previous,
        dictionaryWords,
      );

      if (
        hasInProgressGame(previous) &&
        resolvedAnswer &&
        resolvedAnswer !== previous.answer
      ) {
        return {
          ...previous,
          answer: resolvedAnswer,
        };
      }

      if (hasInProgressGame(previous)) {
        return previous;
      }

      if (isValidWord(previous.answer)) {
        return previous;
      }

      return createInitialGameState(currentSessionId, getRandomWord());
    });
  }, [currentSessionId, dictionaryLoading, dictionaryWords]);

  useEffect(() => {
    if (shouldAskToResume(gameState, currentSessionId)) {
      setShowResumeDialog(true);
    }
  }, [gameState, currentSessionId]);

  const won = useMemo(() => isWon(gameState), [gameState]);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), MESSAGE_VISIBILITY_DURATION_MS);
  }, []);

  const resetActiveHints = useCallback(() => {
    setActiveRowHintStatuses({});
    setHintRevealPulse(0);
    setHintRevealTileIndex(null);
  }, []);

  const checkInput = useCallback(
    (input: string) => {
      const validation = validateGuessInput(input, answer, {
        allowUnknownWords,
      });

      if (!validation.ok) {
        showMessage(validation.message);
        return;
      }

      resetActiveHints();
      setGameStateAndPersist((prev) => applyGuess(prev, validation.guess));
    },
    [
      allowUnknownWords,
      answer,
      resetActiveHints,
      setGameStateAndPersist,
      showMessage,
    ],
  );

  const removeCurrentLetter = useCallback(() => {
    if (current.length === 0) {
      return;
    }

    const removedIndex = current.length - 1;

    setGameStateAndPersist((prev) => removeLetter(prev));
    setActiveRowHintStatuses((previous) => {
      if (!(removedIndex in previous)) {
        return previous;
      }

      const next = { ...previous };
      delete next[removedIndex];
      return next;
    });

    if (hintRevealTileIndex === removedIndex) {
      setHintRevealTileIndex(null);
    }
  }, [current.length, hintRevealTileIndex, setGameStateAndPersist]);

  const addCurrentLetter = useCallback(
    (letter: string) => {
      setGameStateAndPersist((prev) => addLetter(prev, letter));
    },
    [setGameStateAndPersist],
  );

  const revealHint = useCallback(
    (hintStatus: HintTileStatus): boolean => {
      if (gameOver || showResumeDialog) {
        return false;
      }

      if (current.length >= WORD_LENGTH) {
        showMessage(ROW_ALREADY_FULL_MESSAGE);
        return false;
      }

      const nextIndex = current.length;
      const letter =
        hintStatus === "correct"
          ? answer[nextIndex]
          : getPresentHintLetter(answer, nextIndex, current);

      if (!letter) {
        showMessage(NO_PRESENT_HINT_AVAILABLE_MESSAGE);
        return false;
      }

      setGameStateAndPersist((previous) => addLetter(previous, letter));
      setActiveRowHintStatuses((previous) => ({
        ...previous,
        [nextIndex]: hintStatus,
      }));
      setHintRevealTileIndex(nextIndex);
      setHintRevealPulse((previous) => previous + 1);

      return true;
    },
    [
      answer,
      current,
      gameOver,
      setGameStateAndPersist,
      showMessage,
      showResumeDialog,
    ],
  );

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
    setGameStateAndPersist((prev) => ({
      ...prev,
      sessionId: currentSessionId,
    }));
    setShowResumeDialog(false);
    resetActiveHints();
  }, [currentSessionId, resetActiveHints, setGameStateAndPersist]);

  const triggerStartAnimation = useCallback(() => {
    if (animationsDisabled) {
      return;
    }

    markStartAnimationAsSeen();
    setStartAnimationSeed((prev) => prev + 1);
  }, [animationsDisabled]);

  const resetBoard = useCallback(() => {
    setGameStateAndPersist(() =>
      createInitialGameState(currentSessionId, getRandomWord()),
    );
    setBoardVersion((previous) => previous + 1);
    setShowResumeDialog(false);
    setMessage("");
    resetActiveHints();
    triggerStartAnimation();
  }, [
    currentSessionId,
    resetActiveHints,
    setGameStateAndPersist,
    triggerStartAnimation,
  ]);

  const startNewBoard = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const refresh = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const forceLoss = useCallback(() => {
    setGameStateAndPersist((previous) => {
      if (previous.gameOver) {
        return previous;
      }

      return {
        ...previous,
        current: "",
        gameOver: true,
      };
    });
  }, [setGameStateAndPersist]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (isDirectGameKeyboardKey(event.key)) {
        blurRefreshButtonIfFocused();
      }

      handleKey(
        event.key === "Backspace" ? "BACKSPACE" : event.key.toUpperCase(),
      );
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return {
    sessionId,
    gameId,
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
    boardVersion,
    forceLoss,
    showResumeDialog,
    continuePreviousBoard,
    startNewBoard,
    dictionaryWords,
    dictionaryLoading,
    dictionaryError,
    revealHint,
    activeRowHintStatuses,
    hintRevealPulse,
    hintRevealTileIndex,
  };
}
