import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addLetter,
  applyGuess,
  createInitialGameState,
  getTodayDateUTC,
  getOrCreateSessionId,
  hasInProgressGame,
  isLetterKey,
  isWon,
  normalizePersistedGameState,
  persistGameState,
  readPersistedGameState,
  removeLetterAt,
  resolveAnswerFromGameReference,
  resolveDailyAnswer,
  removeLetter,
  setLetterAt,
  shouldAskToResume,
  resolveBoardRoundConfig,
  WORDLE_MODE_IDS,
  type PersistedGameState,
  validateGuessInput,
} from "@domain/wordle";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import useDictionaryQuery from "../useDictionaryQuery";
import {
  getRandomWord,
  isValidWord,
  loadWordDictionaryFromCache,
  setWordDictionary,
} from "@utils/words";
import { useApi } from "@providers";
import { useSound } from "@providers/Sound";
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
  getFirstEmptyTileIndex,
  getPresentHintLetter,
  isDirectGameKeyboardKey,
  isEditableKeyboardTarget,
  markStartAnimationAsSeen,
  shiftHintStatusesLeftFromIndex,
  shouldAnimateKeyboardEntryOnSession,
  shouldAnimateOnFirstSessionView,
} from "./utils";

export default function useWordle(options: UseWordleOptions = {}) {
  const {
    allowUnknownWords = false,
    language = WORDS_DEFAULT_LANGUAGE,
    manualTileSelection = false,
    roundConfig,
    modeId,
  } = options;
  const { dailyWordClient } = useApi();
  const dailyModeActive = modeId === WORDLE_MODE_IDS.DAILY;
  const dailyDate = useMemo(getTodayDateUTC, []);
  const [remoteDailyWord, setRemoteDailyWord] = useState<string | null>(null);
  const baseRoundConfig = useMemo(
    () => resolveBoardRoundConfig(roundConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundConfig?.lettersPerRow, roundConfig?.maxGuesses],
  );
  const cachedWords = useMemo(
    () => loadWordDictionaryFromCache(language),
    [language],
  );
  const { playSound } = useSound();
  const currentSessionId = useMemo(getOrCreateSessionId, []);
  const initialAnswer = useMemo(
    () =>
      dailyModeActive
        ? resolveDailyAnswer({
            words: cachedWords,
            date: dailyDate,
          })
        : getRandomWord(),
    [cachedWords, dailyDate, dailyModeActive],
  );
  const [dailyLettersPerRow, setDailyLettersPerRow] = useState(
    () => initialAnswer.length,
  );
  const resolvedRoundConfig = useMemo(
    () =>
      dailyModeActive
        ? resolveBoardRoundConfig({
            ...baseRoundConfig,
            lettersPerRow: dailyLettersPerRow,
          })
        : baseRoundConfig,
    [baseRoundConfig, dailyLettersPerRow, dailyModeActive],
  );
  const initialGameState = useMemo(
    () =>
      normalizePersistedGameState(
        readPersistedGameState(modeId),
        currentSessionId,
        initialAnswer,
        cachedWords,
        resolvedRoundConfig,
      ),
    [cachedWords, currentSessionId, initialAnswer, modeId, resolvedRoundConfig],
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
  const [invalidGuessShakePulse, setInvalidGuessShakePulse] = useState(0);
  const [showDictionaryChecksumDialog, setShowDictionaryChecksumDialog] =
    useState(false);
  const persistenceTimeoutRef = useRef<number | null>(null);
  const latestGameStateRef = useRef(initialGameState);
  const previousLanguageRef = useRef(language);
  const previousRoundConfigRef = useRef(resolvedRoundConfig);

  useEffect(() => {
    if (!dailyModeActive) {
      return;
    }

    const initialLettersPerRow = Math.max(1, initialAnswer.length);
    setDailyLettersPerRow((previous) =>
      previous === initialLettersPerRow ? previous : initialLettersPerRow,
    );
  }, [dailyModeActive, initialAnswer.length]);

  const handleDictionaryChecksumMismatch = useCallback(() => {
    const latestState = latestGameStateRef.current;
    const activeGame = !latestState.gameOver && hasInProgressGame(latestState);
    if (!activeGame) {
      return;
    }

    setShowDictionaryChecksumDialog(true);
  }, []);
  const { data: dictionaryData, isLoading: dictionaryLoading } =
    useDictionaryQuery(language, cachedWords, {
      onChecksumMismatch: handleDictionaryChecksumMismatch,
    });
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
  const resolvedDailyAnswer = useMemo(() => {
    if (!dailyModeActive) {
      return null;
    }

    return resolveDailyAnswer({
      words: dictionaryWords,
      date: dailyDate,
      remoteDailyWord,
    });
  }, [dailyDate, dailyModeActive, dictionaryWords, remoteDailyWord]);

  useEffect(() => {
    if (!dailyModeActive) {
      return;
    }

    let cancelled = false;

    void dailyWordClient
      .getDailyWord(dailyDate)
      .then((dailyWord) => {
        if (cancelled || !dailyWord) {
          return;
        }

        setRemoteDailyWord(dailyWord);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [dailyDate, dailyModeActive, dailyWordClient]);

  const { sessionId, gameId, answer, startedAt, guesses, current, gameOver } =
    gameState;
  const maxSelectableTileIndex = resolvedRoundConfig.lettersPerRow - 1;
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

  const flushPersistedGameState = useCallback(
    (state: PersistedGameState) => {
      persistGameState(state, modeId);
    },
    [modeId],
  );

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
    if (!dailyModeActive || !resolvedDailyAnswer) {
      return;
    }

    const nextLettersPerRow = Math.max(1, resolvedDailyAnswer.length);
    setDailyLettersPerRow((previous) =>
      previous === nextLettersPerRow ? previous : nextLettersPerRow,
    );
  }, [dailyModeActive, resolvedDailyAnswer]);

  useEffect(() => {
    if (!dailyModeActive || !resolvedDailyAnswer) {
      return;
    }

    setGameStateWithPersistence((previous) => {
      if (hasInProgressGame(previous) || previous.gameOver) {
        return previous;
      }

      if (previous.answer === resolvedDailyAnswer) {
        return previous;
      }

      return createInitialGameState(currentSessionId, resolvedDailyAnswer);
    }, "immediate");
  }, [
    currentSessionId,
    dailyModeActive,
    resolvedDailyAnswer,
    setGameStateWithPersistence,
  ]);

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

      const nextAnswer = dailyModeActive
        ? resolveDailyAnswer({
            words: dictionaryWords,
            date: dailyDate,
            remoteDailyWord,
          })
        : getRandomWord();

      return createInitialGameState(currentSessionId, nextAnswer);
    });
  }, [
    currentSessionId,
    dailyDate,
    dailyModeActive,
    dictionaryLoading,
    dictionaryWords,
    remoteDailyWord,
  ]);

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

  const triggerInvalidGuessFeedback = useCallback(() => {
    playSound("guess_invalid");
    setInvalidGuessShakePulse((previous) => previous + 1);
  }, [playSound]);

  const checkInput = useCallback(
    (input: string) => {
      const validation = validateGuessInput(input, answer, {
        allowUnknownWords,
        roundConfig: resolvedRoundConfig,
      });

      if (!validation.ok) {
        if (validation.message === "Not enough letters") {
          showMessage(i18n.t("play.gameplay.messages.notEnoughLetters"));
          triggerInvalidGuessFeedback();
          return;
        }

        if (validation.message === "Not in word list") {
          showMessage(i18n.t("play.gameplay.messages.notInWordList"));
          triggerInvalidGuessFeedback();
          return;
        }

        showMessage(validation.message);
        triggerInvalidGuessFeedback();
        return;
      }

      resetActiveHints();
      setGameStateWithPersistence(
        (prev) => applyGuess(prev, validation.guess, resolvedRoundConfig),
        "immediate",
      );
    },
    [
      allowUnknownWords,
      answer,
      resetActiveHints,
      resolvedRoundConfig,
      setGameStateWithPersistence,
      showMessage,
      triggerInvalidGuessFeedback,
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
      playSound("letter_delete");
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
    playSound("letter_delete");
  }, [
    current.length,
    hintRevealTileIndex,
    manualTileSelection,
    playSound,
    selectedTileIndex,
    setGameStateWithPersistence,
  ]);

  const addCurrentLetter = useCallback(
    (letter: string) => {
      if (!manualTileSelection) {
        if (current.length >= resolvedRoundConfig.lettersPerRow) {
          return;
        }

        setGameStateWithPersistence((prev) =>
          addLetter(prev, letter, resolvedRoundConfig),
        );
        playSound("letter_put");
        return;
      }

      const targetIndex = selectedTileIndex ?? 0;
      if (targetIndex < 0 || targetIndex >= resolvedRoundConfig.lettersPerRow) {
        return;
      }

      setGameStateWithPersistence((prev) =>
        setLetterAt(prev, targetIndex, letter, resolvedRoundConfig),
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
      playSound("letter_put");
    },
    [
      current.length,
      manualTileSelection,
      playSound,
      resolvedRoundConfig,
      selectedTileIndex,
      setGameStateWithPersistence,
    ],
  );

  const selectActiveTile = useCallback(
    (index: number) => {
      if (
        !manualTileSelection ||
        gameOver ||
        showResumeDialog ||
        showDictionaryChecksumDialog
      ) {
        return;
      }

      setActiveTileIndex(Math.min(Math.max(index, 0), maxSelectableTileIndex));
    },
    [
      gameOver,
      manualTileSelection,
      maxSelectableTileIndex,
      showDictionaryChecksumDialog,
      showResumeDialog,
    ],
  );

  const moveActiveTile = useCallback(
    (direction: -1 | 1) => {
      if (
        !manualTileSelection ||
        gameOver ||
        showResumeDialog ||
        showDictionaryChecksumDialog
      ) {
        return;
      }

      setActiveTileIndex((previous) =>
        Math.min(Math.max(previous + direction, 0), maxSelectableTileIndex),
      );
    },
    [
      gameOver,
      manualTileSelection,
      maxSelectableTileIndex,
      showDictionaryChecksumDialog,
      showResumeDialog,
    ],
  );

  const revealHint = useCallback(
    (hintStatus: HintTileStatus): boolean => {
      if (gameOver || showResumeDialog || showDictionaryChecksumDialog) {
        return false;
      }

      const nextIndex = getFirstEmptyTileIndex(
        current,
        resolvedRoundConfig.lettersPerRow,
      );
      if (nextIndex === null) {
        showMessage(i18n.t(ROW_ALREADY_FULL_MESSAGE_KEY));
        return false;
      }

      const letter =
        hintStatus === "correct"
          ? answer[nextIndex]
          : getPresentHintLetter(answer, nextIndex, current);

      if (!letter) {
        showMessage(i18n.t(NO_PRESENT_HINT_AVAILABLE_MESSAGE_KEY));
        return false;
      }

      setGameStateWithPersistence((previous) =>
        setLetterAt(previous, nextIndex, letter, resolvedRoundConfig),
      );
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
      resolvedRoundConfig,
      setGameStateWithPersistence,
      showMessage,
      showDictionaryChecksumDialog,
      showResumeDialog,
    ],
  );

  const handleKey = useCallback(
    (key: string) => {
      if (gameOver || showResumeDialog || showDictionaryChecksumDialog) {
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

      if (isLetterKey(key, language)) {
        addCurrentLetter(key);
      }
    },
    [
      addCurrentLetter,
      checkInput,
      current,
      gameOver,
      language,
      moveActiveTile,
      removeCurrentLetter,
      showDictionaryChecksumDialog,
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
  const acknowledgeDictionaryChecksumChange = useCallback(() => {
    setShowDictionaryChecksumDialog(false);
  }, []);

  const resolveNextBoardAnswer = useCallback(() => {
    if (!dailyModeActive) {
      return getRandomWord();
    }

    return resolveDailyAnswer({
      words: dictionaryWords,
      date: dailyDate,
      remoteDailyWord,
    });
  }, [dailyDate, dailyModeActive, dictionaryWords, remoteDailyWord]);

  const resetBoard = useCallback(() => {
    setGameStateWithPersistence(
      () => createInitialGameState(currentSessionId, resolveNextBoardAnswer()),
      "immediate",
    );
    setBoardVersion((previous) => previous + 1);
    setShowResumeDialog(false);
    setShowDictionaryChecksumDialog(false);
    setMessage("");
    resetActiveHints();
    setInvalidGuessShakePulse(0);
    triggerStartAnimation();
  }, [
    currentSessionId,
    resetActiveHints,
    resolveNextBoardAnswer,
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
    const previousRoundConfig = previousRoundConfigRef.current;
    const configChanged =
      previousRoundConfig.lettersPerRow !== resolvedRoundConfig.lettersPerRow ||
      previousRoundConfig.maxGuesses !== resolvedRoundConfig.maxGuesses;

    if (!configChanged) {
      return;
    }

    previousRoundConfigRef.current = resolvedRoundConfig;
    resetBoard();
  }, [resolvedRoundConfig, resetBoard]);

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
    roundStartedAt: startedAt,
    roundConfig: resolvedRoundConfig,
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
    showDictionaryChecksumDialog,
    acknowledgeDictionaryChecksumChange,
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
    invalidGuessShakePulse,
  };
}
