import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  removeLetterAt,
  resolveAnswerFromGameReference,
  removeLetter,
  setLetterAt,
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
  GAME_STATE_PERSIST_DEBOUNCE_MS,
  MESSAGE_VISIBILITY_DURATION_MS,
  NO_PRESENT_HINT_AVAILABLE_MESSAGE_KEY,
  ROW_ALREADY_FULL_MESSAGE_KEY,
} from "./constants";
import { i18n } from "@i18n";
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

const shiftHintStatusesLeftFromIndex = (
  previous: Record<number, HintTileStatus>,
  removedIndex: number,
): Record<number, HintTileStatus> => {
  let changed = false;
  const next: Record<number, HintTileStatus> = {};

  for (const [rawIndex, status] of Object.entries(previous)) {
    const index = Number(rawIndex);
    if (!Number.isInteger(index)) {
      continue;
    }

    if (index === removedIndex) {
      changed = true;
      continue;
    }

    if (index > removedIndex) {
      next[index - 1] = status;
      changed = true;
      continue;
    }

    next[index] = status;
  }

  return changed ? next : previous;
};

export default function useWordle(options: UseWordleOptions = {}) {
  const {
    allowUnknownWords = false,
    language = WORDS_DEFAULT_LANGUAGE,
    manualTileSelection = false,
  } = options;
  const cachedWords = useMemo(
    () => loadWordDictionaryFromCache(language),
    [language],
  );
  const { data: dictionaryData, isLoading: dictionaryLoading } =
    useDictionaryQuery(language, cachedWords);

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
        ? i18n.t("play.toolbar.wordListUnavailable")
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
  const [activeTileIndex, setActiveTileIndex] = useState(0);
  const [hintRevealPulse, setHintRevealPulse] = useState(0);
  const [hintRevealTileIndex, setHintRevealTileIndex] = useState<number | null>(
    null,
  );
  const persistenceTimeoutRef = useRef<number | null>(null);
  const latestGameStateRef = useRef(initialGameState);
  const previousLanguageRef = useRef(language);

  const { sessionId, gameId, answer, guesses, current, gameOver } = gameState;
  const maxSelectableTileIndex = WORD_LENGTH - 1;
  const selectedTileIndex = manualTileSelection
    ? Math.min(Math.max(activeTileIndex, 0), maxSelectableTileIndex)
    : null;

  useEffect(() => {
    if (!manualTileSelection) {
      return;
    }

    setActiveTileIndex((previous) =>
      Math.min(Math.max(previous, 0), maxSelectableTileIndex),
    );
  }, [manualTileSelection, maxSelectableTileIndex]);

  const flushPersistedGameState = useCallback((state: PersistedGameState) => {
    persistGameState(state);
  }, []);

  const cancelDeferredPersist = useCallback(() => {
    if (persistenceTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(persistenceTimeoutRef.current);
    persistenceTimeoutRef.current = null;
  }, []);

  const schedulePersistedGameState = useCallback(
    (state: PersistedGameState) => {
      cancelDeferredPersist();
      persistenceTimeoutRef.current = window.setTimeout(() => {
        flushPersistedGameState(state);
        persistenceTimeoutRef.current = null;
      }, GAME_STATE_PERSIST_DEBOUNCE_MS);
    },
    [cancelDeferredPersist, flushPersistedGameState],
  );

  const setGameStateWithPersistence = useCallback(
    (
      updater: (previous: PersistedGameState) => PersistedGameState,
      persistence: "deferred" | "immediate" = "deferred",
    ) => {
      setGameState((previous) => {
        const next = updater(previous);
        latestGameStateRef.current = next;

        if (persistence === "immediate") {
          cancelDeferredPersist();
          flushPersistedGameState(next);
          return next;
        }

        schedulePersistedGameState(next);
        return next;
      });
    },
    [
      cancelDeferredPersist,
      flushPersistedGameState,
      schedulePersistedGameState,
    ],
  );

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (dictionaryWords.length === 0) {
      return;
    }

    setWordDictionary(dictionaryWords, language);
  }, [dictionaryWords, language]);

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
        if (validation.message === "Not enough letters") {
          showMessage(i18n.t("play.gameplay.messages.notEnoughLetters"));
          return;
        }

        if (validation.message === "Not in word list") {
          showMessage(i18n.t("play.gameplay.messages.notInWordList"));
          return;
        }

        showMessage(validation.message);
        return;
      }

      resetActiveHints();
      setGameStateWithPersistence(
        (prev) => applyGuess(prev, validation.guess),
        "immediate",
      );
    },
    [
      allowUnknownWords,
      answer,
      resetActiveHints,
      setGameStateWithPersistence,
      showMessage,
    ],
  );

  const removeCurrentLetter = useCallback(() => {
    if (current.length === 0) {
      return;
    }

    if (manualTileSelection) {
      const removedIndex = selectedTileIndex ?? 0;
      if (removedIndex < 0 || removedIndex >= current.length) {
        return;
      }

      setGameStateWithPersistence((prev) => removeLetterAt(prev, removedIndex));
      setActiveRowHintStatuses((previous) =>
        shiftHintStatusesLeftFromIndex(previous, removedIndex),
      );
      setHintRevealTileIndex((previous) => {
        if (previous === null) {
          return null;
        }

        if (previous === removedIndex) {
          return null;
        }

        if (previous > removedIndex) {
          return previous - 1;
        }

        return previous;
      });
      return;
    }

    const removedIndex = current.length - 1;

    setGameStateWithPersistence((prev) => removeLetter(prev));
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
  }, [
    current.length,
    hintRevealTileIndex,
    manualTileSelection,
    selectedTileIndex,
    setGameStateWithPersistence,
  ]);

  const addCurrentLetter = useCallback(
    (letter: string) => {
      if (!manualTileSelection) {
        setGameStateWithPersistence((prev) => addLetter(prev, letter));
        return;
      }

      const targetIndex = selectedTileIndex ?? 0;

      setGameStateWithPersistence((prev) =>
        setLetterAt(prev, targetIndex, letter),
      );
      setActiveRowHintStatuses((previous) => {
        if (!(targetIndex in previous)) {
          return previous;
        }

        const next = { ...previous };
        delete next[targetIndex];
        return next;
      });
      setHintRevealTileIndex((previous) =>
        previous === targetIndex ? null : previous,
      );
    },
    [manualTileSelection, selectedTileIndex, setGameStateWithPersistence],
  );

  const selectActiveTile = useCallback(
    (index: number) => {
      if (!manualTileSelection || gameOver || showResumeDialog) {
        return;
      }

      setActiveTileIndex(Math.min(Math.max(index, 0), maxSelectableTileIndex));
    },
    [gameOver, manualTileSelection, maxSelectableTileIndex, showResumeDialog],
  );

  const moveActiveTile = useCallback(
    (direction: -1 | 1) => {
      if (!manualTileSelection || gameOver || showResumeDialog) {
        return;
      }

      setActiveTileIndex((previous) =>
        Math.min(Math.max(previous + direction, 0), maxSelectableTileIndex),
      );
    },
    [gameOver, manualTileSelection, maxSelectableTileIndex, showResumeDialog],
  );

  const revealHint = useCallback(
    (hintStatus: HintTileStatus): boolean => {
      if (gameOver || showResumeDialog) {
        return false;
      }

      if (current.length >= WORD_LENGTH) {
        showMessage(i18n.t(ROW_ALREADY_FULL_MESSAGE_KEY));
        return false;
      }

      const nextIndex = current.length;
      const letter =
        hintStatus === "correct"
          ? answer[nextIndex]
          : getPresentHintLetter(answer, nextIndex, current);

      if (!letter) {
        showMessage(i18n.t(NO_PRESENT_HINT_AVAILABLE_MESSAGE_KEY));
        return false;
      }

      setGameStateWithPersistence((previous) => addLetter(previous, letter));
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
      setGameStateWithPersistence,
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

      if (key === "ARROWLEFT") {
        moveActiveTile(-1);
        return;
      }

      if (key === "ARROWRIGHT") {
        moveActiveTile(1);
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
      moveActiveTile,
      removeCurrentLetter,
      showResumeDialog,
    ],
  );

  const continuePreviousBoard = useCallback(() => {
    setGameStateWithPersistence(
      (prev) => ({
        ...prev,
        sessionId: currentSessionId,
      }),
      "immediate",
    );
    setShowResumeDialog(false);
    resetActiveHints();
  }, [currentSessionId, resetActiveHints, setGameStateWithPersistence]);

  const triggerStartAnimation = useCallback(() => {
    if (animationsDisabled) {
      return;
    }

    markStartAnimationAsSeen();
    setStartAnimationSeed((prev) => prev + 1);
  }, [animationsDisabled]);

  const resetBoard = useCallback(() => {
    setGameStateWithPersistence(
      () => createInitialGameState(currentSessionId, getRandomWord()),
      "immediate",
    );
    setBoardVersion((previous) => previous + 1);
    setShowResumeDialog(false);
    setMessage("");
    resetActiveHints();
    triggerStartAnimation();
  }, [
    currentSessionId,
    resetActiveHints,
    setGameStateWithPersistence,
    triggerStartAnimation,
  ]);

  const startNewBoard = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const refresh = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const forceLoss = useCallback(() => {
    setGameStateWithPersistence((previous) => {
      if (previous.gameOver) {
        return previous;
      }

      return {
        ...previous,
        current: "",
        gameOver: true,
      };
    }, "immediate");
  }, [setGameStateWithPersistence]);

  useEffect(() => {
    if (previousLanguageRef.current === language) {
      return;
    }

    previousLanguageRef.current = language;
    resetBoard();
  }, [language, resetBoard]);

  useEffect(() => {
    const persistLatestGameState = () => {
      cancelDeferredPersist();
      flushPersistedGameState(latestGameStateRef.current);
    };

    window.addEventListener("beforeunload", persistLatestGameState);
    window.addEventListener("pagehide", persistLatestGameState);

    return () => {
      window.removeEventListener("beforeunload", persistLatestGameState);
      window.removeEventListener("pagehide", persistLatestGameState);
      persistLatestGameState();
    };
  }, [cancelDeferredPersist, flushPersistedGameState]);

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
    activeTileIndex: selectedTileIndex,
    selectActiveTile,
    hintRevealPulse,
    hintRevealTileIndex,
  };
}
