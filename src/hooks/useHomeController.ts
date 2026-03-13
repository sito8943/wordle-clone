import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPointsForWin } from "../domain/wordle";
import { usePlayer } from "../providers";
import { useWordle } from "./useWordle";

const getDifficultyScoreMultiplier = (
  difficulty: "easy" | "normal" | "hard",
): number => {
  if (difficulty === "easy") {
    return 1;
  }

  if (difficulty === "hard") {
    return 3;
  }

  return 2;
};

export default function useHomeController() {
  const { player, increaseScore, increaseWinStreak, resetWinStreak } =
    usePlayer();
  const wordle = useWordle();
  const { won, guesses, current, gameOver, refresh, showResumeDialog } = wordle;

  const roundSettled = useRef(false);
  const hydrated = useRef(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [showWordsDialog, setShowWordsDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const hasActiveGame = useMemo(
    () => !gameOver && (guesses.length > 0 || current.length > 0),
    [current.length, gameOver, guesses.length],
  );
  const wordListEnabledForDifficulty = player.difficulty === "easy";

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

  const refreshBoardNow = useCallback(() => {
    refresh();
  }, [refresh]);

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

  return {
    ...wordle,
    currentWinStreak: player.streak,
    wordListEnabledForDifficulty,
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
