import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPointsForWin, WORD_LENGTH } from "../../domain/wordle";
import { usePlayer } from "../../providers";
import { HARD_MODE_FINAL_STRETCH_SECONDS } from "./constants";
import {
  clearHardModeTimerSnapshot,
  getDefaultHardModeTimerSnapshot,
  getDifficultyScoreMultiplier,
  getHintStatusByDifficulty,
  getHardModeClockBoostScale,
  getHardModeFinalStretchProgressPercent,
  getHintsLimitByDifficulty,
  getInitialHintUsageSnapshot,
  getInitialHardModeTimerSnapshot,
  isWithinHardModeFinalStretch,
  setHintUsageSnapshot,
  setHardModeTimerSnapshot,
} from "./utils";
import { useWordle } from "../useWordle";

export default function useHomeController() {
  const { player, increaseScore, increaseWinStreak, resetWinStreak } =
    usePlayer();
  const wordle = useWordle({
    allowUnknownWords:
      player.difficulty === "hard" || player.difficulty === "insane",
  });
  const {
    sessionId,
    answer,
    won,
    guesses,
    current,
    gameOver,
    refresh,
    forceLoss,
    showResumeDialog,
    boardVersion,
    revealHint,
    activeRowHintStatuses,
    hintRevealPulse,
    hintRevealTileIndex,
  } = wordle;
  const hardModeEnabled = player.difficulty === "insane";
  const hintsLimit = getHintsLimitByDifficulty(player.difficulty);
  const hasInProgressGameAtMount =
    !gameOver && (guesses.length > 0 || current.length > 0);
  const initialHintUsageSnapshot = getInitialHintUsageSnapshot(
    sessionId,
    answer,
    hasInProgressGameAtMount,
  );
  const initialHardModeTimerSnapshot = getInitialHardModeTimerSnapshot(
    sessionId,
    hardModeEnabled,
    hasInProgressGameAtMount,
  );

  const roundSettled = useRef(false);
  const hydrated = useRef(false);
  const skipInitialHardModeReset = useRef(true);
  const skipInitialHintsBoardReset = useRef(true);
  const skipInitialHintsDifficultyReset = useRef(true);
  const hardModeEnabledRef = useRef(hardModeEnabled);
  const hardModeTimerStateRef = useRef(initialHardModeTimerSnapshot);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showWordsDialog, setShowWordsDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [hardModeSecondsLeft, setHardModeSecondsLeft] = useState(
    initialHardModeTimerSnapshot.secondsLeft,
  );
  const [hardModeTimerStarted, setHardModeTimerStarted] = useState(
    initialHardModeTimerSnapshot.timerStarted,
  );
  const [hardModeTickPulse, setHardModeTickPulse] = useState(0);
  const [boardShakePulse, setBoardShakePulse] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(
    initialHintUsageSnapshot.hintsUsed,
  );

  const hasActiveGame = useMemo(
    () => !gameOver && (guesses.length > 0 || current.length > 0),
    [current.length, gameOver, guesses.length],
  );
  const wordListEnabledForDifficulty = player.difficulty === "easy";
  const hintsRemaining = Math.max(0, hintsLimit - hintsUsed);
  const hintsEnabledForDifficulty = hintsLimit > 0;
  const hintButtonDisabled =
    hintsRemaining <= 0 ||
    showResumeDialog ||
    gameOver ||
    current.length >= WORD_LENGTH;
  const showHardModeTimer = hardModeEnabled && !showResumeDialog && !gameOver;
  const hardModeTimerRunning = showHardModeTimer && hardModeTimerStarted;
  const showHardModeFinalStretchBar =
    showHardModeTimer && hardModeSecondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS;
  const hardModeFinalStretchProgressPercent =
    getHardModeFinalStretchProgressPercent(hardModeSecondsLeft);
  const hardModeClockBoostScale = useMemo(
    () => getHardModeClockBoostScale(hardModeSecondsLeft),
    [hardModeSecondsLeft],
  );
  const effectiveBoardShakePulse =
    hardModeTimerRunning && isWithinHardModeFinalStretch(hardModeSecondsLeft)
      ? boardShakePulse
      : 0;

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;

      if (gameOver && !won) {
        resetWinStreak();
      }

      roundSettled.current = gameOver;
      return;
    }

    if (!gameOver) {
      roundSettled.current = false;
      return;
    }

    if (roundSettled.current) {
      return;
    }

    if (won) {
      const difficultyMultiplier = getDifficultyScoreMultiplier(
        player.difficulty,
      );
      increaseScore(getPointsForWin(guesses.length) * difficultyMultiplier);
      increaseWinStreak();
    } else {
      resetWinStreak();
    }

    roundSettled.current = true;
  }, [
    gameOver,
    guesses.length,
    increaseScore,
    increaseWinStreak,
    player.difficulty,
    resetWinStreak,
    won,
  ]);

  const resetHardModeTimer = useCallback(() => {
    const defaultHardModeTimerSnapshot =
      getDefaultHardModeTimerSnapshot(sessionId);

    setHardModeSecondsLeft(defaultHardModeTimerSnapshot.secondsLeft);
    setHardModeTimerStarted(defaultHardModeTimerSnapshot.timerStarted);
    setHardModeTickPulse(0);
    setBoardShakePulse(0);
    hardModeTimerStateRef.current = defaultHardModeTimerSnapshot;

    if (hardModeEnabled) {
      setHardModeTimerSnapshot(defaultHardModeTimerSnapshot);
    }
  }, [hardModeEnabled, sessionId]);

  const refreshBoardNow = useCallback(() => {
    resetHardModeTimer();
    refresh();
  }, [refresh, resetHardModeTimer]);

  const refreshBoard = useCallback(() => {
    if (hasActiveGame) {
      setShowRefreshDialog(true);
      return;
    }

    refreshBoardNow();
  }, [hasActiveGame, refreshBoardNow]);

  const confirmRefreshBoard = useCallback(() => {
    setShowRefreshDialog(false);
    refreshBoardNow();
  }, [refreshBoardNow]);

  const cancelRefreshBoard = useCallback(() => {
    setShowRefreshDialog(false);
  }, []);

  const openWordsDialog = useCallback(() => {
    if (!wordListEnabledForDifficulty) {
      return;
    }

    setShowWordsDialog(true);
  }, [wordListEnabledForDifficulty]);

  const closeWordsDialog = useCallback(() => {
    setShowWordsDialog(false);
  }, []);

  const openHelpDialog = useCallback(() => {
    setShowHelpDialog(true);
  }, []);

  const closeHelpDialog = useCallback(() => {
    setShowHelpDialog(false);
  }, []);

  useEffect(() => {
    if (showResumeDialog) {
      setShowRefreshDialog(false);
      setShowWordsDialog(false);
      setShowHelpDialog(false);
    }
  }, [showResumeDialog]);

  useEffect(() => {
    if (!wordListEnabledForDifficulty) {
      setShowWordsDialog(false);
    }
  }, [wordListEnabledForDifficulty]);

  useEffect(() => {
    hardModeTimerStateRef.current = {
      sessionId,
      secondsLeft: hardModeSecondsLeft,
      timerStarted: hardModeTimerStarted,
    };
  }, [hardModeSecondsLeft, hardModeTimerStarted, sessionId]);

  useEffect(() => {
    setHintUsageSnapshot({
      sessionId,
      answer,
      hintsUsed,
    });
  }, [answer, hintsUsed, sessionId]);

  useEffect(() => {
    hardModeEnabledRef.current = hardModeEnabled;

    if (!hardModeEnabled) {
      clearHardModeTimerSnapshot();
    }
  }, [hardModeEnabled]);

  useEffect(() => {
    return () => {
      if (!hardModeEnabledRef.current) {
        return;
      }

      setHardModeTimerSnapshot({ ...hardModeTimerStateRef.current });
    };
  }, []);

  useEffect(() => {
    if (skipInitialHardModeReset.current) {
      skipInitialHardModeReset.current = false;
      return;
    }

    resetHardModeTimer();
  }, [boardVersion, hardModeEnabled, resetHardModeTimer]);

  useEffect(() => {
    if (skipInitialHintsBoardReset.current) {
      skipInitialHintsBoardReset.current = false;
      return;
    }

    setHintsUsed(0);
  }, [boardVersion]);

  useEffect(() => {
    if (skipInitialHintsDifficultyReset.current) {
      skipInitialHintsDifficultyReset.current = false;
      return;
    }

    setHintsUsed(0);
  }, [player.difficulty]);

  useEffect(() => {
    if (
      hardModeTimerStarted ||
      !showHardModeTimer ||
      (guesses.length === 0 && current.length === 0)
    ) {
      return;
    }

    setHardModeTimerStarted(true);
  }, [current.length, guesses.length, hardModeTimerStarted, showHardModeTimer]);

  useEffect(() => {
    if (!hardModeTimerRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setHardModeSecondsLeft((previous) => {
        if (previous <= 0) {
          return 0;
        }

        const next = previous - 1;
        setHardModeTickPulse((pulse) => pulse + 1);

        if (next <= HARD_MODE_FINAL_STRETCH_SECONDS && next > 0) {
          setBoardShakePulse((pulse) => pulse + 1);
        }

        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hardModeTimerRunning]);

  useEffect(() => {
    if (!hardModeTimerRunning || hardModeSecondsLeft > 0) {
      return;
    }

    forceLoss();
  }, [forceLoss, hardModeSecondsLeft, hardModeTimerRunning]);

  const useHint = useCallback(() => {
    if (hintButtonDisabled) {
      return;
    }

    const hintStatus = getHintStatusByDifficulty(player.difficulty);
    if (!hintStatus) {
      return;
    }

    const revealed = revealHint(hintStatus);
    if (!revealed) {
      return;
    }

    setHintsUsed((previous) => {
      const nextHintsUsed = previous + 1;
      setHintUsageSnapshot({
        sessionId,
        answer,
        hintsUsed: nextHintsUsed,
      });
      return nextHintsUsed;
    });
  }, [
    answer,
    hintButtonDisabled,
    player.difficulty,
    revealHint,
    sessionId,
  ]);

  return {
    ...wordle,
    currentWinStreak: player.streak,
    wordListEnabledForDifficulty,
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTimerStarted,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse: effectiveBoardShakePulse,
    useHint,
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    activeRowHintStatuses,
    hintRevealPulse,
    hintRevealTileIndex,
    refreshBoard,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    openWordsDialog,
    closeWordsDialog,
    openHelpDialog,
    closeHelpDialog,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
