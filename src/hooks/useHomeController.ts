import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPointsForWin } from "../domain/wordle";
import { usePlayer } from "../providers";
import useWordle from "./useWordle";

export default function useHomeController() {
  const { increaseScore } = usePlayer();
  const wordle = useWordle();
  const { won, guesses, current, gameOver, refresh, showResumeDialog } = wordle;

  const alreadyScored = useRef(false);
  const hydrated = useRef(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  const hasActiveGame = useMemo(
    () => !gameOver && (guesses.length > 0 || current.length > 0),
    [current.length, gameOver, guesses.length],
  );

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      alreadyScored.current = won;
      return;
    }

    if (won && !alreadyScored.current) {
      increaseScore(getPointsForWin(guesses.length));
      alreadyScored.current = true;
    }

    if (!won) {
      alreadyScored.current = false;
    }
  }, [won, guesses.length, increaseScore]);

  const refreshBoardNow = useCallback(() => {
    refresh();
    alreadyScored.current = false;
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
    refreshBoard,
    showRefreshDialog,
    confirmRefreshBoard,
    cancelRefreshBoard,
  };
}
