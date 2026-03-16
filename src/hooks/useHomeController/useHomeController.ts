import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTotalPointsForWin } from "../../domain/wordle";
import { usePlayer } from "../../providers";
import type { Player } from "../../providers/types";
import { useWordle } from "../useWordle";
import { useHardModeTimer } from "./useHardModeTimer";
import { useHintController } from "./useHintController";
import { getDifficultyScoreMultiplier } from "./utils";

export default function useHomeController() {
  const {
    player,
    replacePlayer,
    increaseScore,
    increaseWinStreak,
    resetWinStreak,
  } = usePlayer();
  const wordle = useWordle({
    allowUnknownWords: player.difficulty !== "insane",
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
    startNewBoard: startNewWordleBoard,
    revealHint,
  } = wordle;
  const hardModeEnabled = player.difficulty === "insane";

  const roundSettled = useRef(false);
  const hydrated = useRef(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showWordsDialog, setShowWordsDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showDeveloperConsoleDialog, setShowDeveloperConsoleDialog] =
    useState(false);

  const hasActiveGame = useMemo(
    () => !gameOver && (guesses.length > 0 || current.length > 0),
    [current.length, gameOver, guesses.length],
  );
  const hasInProgressGameAtMount = hasActiveGame;
  const wordListEnabledForDifficulty = player.difficulty === "easy";
  const {
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTimerStarted,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse,
    resetHardModeTimer,
  } = useHardModeTimer({
    sessionId,
    hardModeEnabled,
    hasInProgressGameAtMount,
    boardVersion,
    showResumeDialog,
    gameOver,
    guessesLength: guesses.length,
    currentLength: current.length,
    forceLoss,
  });
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
      increaseScore(
        getTotalPointsForWin(
          guesses.length,
          difficultyMultiplier,
          player.streak,
        ),
      );
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
    player.streak,
    resetWinStreak,
    won,
  ]);

  const {
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    useHint,
    resetHints,
  } = useHintController({
    answer,
    difficulty: player.difficulty,
    hasInProgressGameAtMount,
    showResumeDialog,
    gameOver,
    currentLength: current.length,
    revealHint,
  });

  const refreshBoardNow = useCallback(() => {
    resetHints();
    resetHardModeTimer();
    refresh();
  }, [refresh, resetHardModeTimer, resetHints]);

  const startNewBoard = useCallback(() => {
    resetHints();
    resetHardModeTimer();
    startNewWordleBoard();
  }, [resetHardModeTimer, resetHints, startNewWordleBoard]);

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

  const openDeveloperConsoleDialog = useCallback(() => {
    setShowDeveloperConsoleDialog(true);
  }, []);

  const closeDeveloperConsoleDialog = useCallback(() => {
    setShowDeveloperConsoleDialog(false);
  }, []);

  const submitDeveloperPlayer = useCallback(
    (nextPlayer: Partial<Player>) => {
      replacePlayer(nextPlayer);
      setShowDeveloperConsoleDialog(false);
    },
    [replacePlayer],
  );

  useEffect(() => {
    if (showResumeDialog) {
      setShowRefreshDialog(false);
      setShowWordsDialog(false);
      setShowHelpDialog(false);
      setShowDeveloperConsoleDialog(false);
    }
  }, [showResumeDialog]);

  useEffect(() => {
    if (!wordListEnabledForDifficulty) {
      setShowWordsDialog(false);
    }
  }, [wordListEnabledForDifficulty]);

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
    boardShakePulse,
    useHint,
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    startNewBoard,
    refreshBoard,
    showRefreshDialog,
    showWordsDialog,
    showHelpDialog,
    showDeveloperConsoleDialog,
    openWordsDialog,
    closeWordsDialog,
    openHelpDialog,
    closeHelpDialog,
    openDeveloperConsoleDialog,
    closeDeveloperConsoleDialog,
    submitDeveloperPlayer,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
