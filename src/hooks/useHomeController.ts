import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPointsForWin } from "../domain/wordle";
import { usePlayer } from "../providers";
import { useWordle } from "./useWordle";

export default function useHomeController() {
  const { player, increaseScore, increaseWinStreak, resetWinStreak } =
    usePlayer();
  const wordle = useWordle();
  const { won, guesses, current, gameOver, refresh, showResumeDialog } = wordle;

  const roundSettled = useRef(false);
  const hydrated = useRef(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  const hasActiveGame = useMemo(
    () => !gameOver && (guesses.length > 0 || current.length > 0),
    [current.length, gameOver, guesses.length],
  );

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
      increaseScore(getPointsForWin(guesses.length));
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

  useEffect(() => {
    if (showResumeDialog) {
      setShowRefreshDialog(false);
    }
  }, [showResumeDialog]);

  return {
    ...wordle,
    currentWinStreak: player.streak,
    refreshBoard,
    showRefreshDialog,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
