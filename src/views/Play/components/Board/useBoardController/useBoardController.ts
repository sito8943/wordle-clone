import { useEffect, useMemo, useState } from "react";
import { buildBoardRows } from "@domain/wordle";
import { BOARD_SHAKE_DURATION_MS } from "../constants";
import type { BoardRowViewModel, UseBoardControllerParams } from "../types";

const useBoardController = ({
  guesses,
  current,
  gameOver,
  roundConfig,
  animateTileEntry = false,
  isLoss = false,
  shakePulse = 0,
  hintRevealPulse = 0,
  activeRowHintStatuses = {},
  hintRevealTileIndex = null,
  normalDictionaryBonusRowFlags = [],
  activeTileIndex = null,
  onTileSelect,
}: UseBoardControllerParams) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (shakePulse <= 0) {
      return;
    }

    setIsShaking(true);

    const timeoutId = window.setTimeout(() => {
      setIsShaking(false);
    }, BOARD_SHAKE_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shakePulse]);

  const rows = useMemo<BoardRowViewModel[]>(() => {
    const boardRows = buildBoardRows(guesses, current, gameOver, roundConfig);
    const activeRowIndex = !gameOver ? guesses.length : -1;

    return boardRows.map((row, index) => {
      const statuses =
        index === activeRowIndex
          ? row.statuses.map(
              (status, cellIndex) => activeRowHintStatuses[cellIndex] ?? status,
            )
          : row.statuses;
      const resolvedActiveTileIndex =
        index === activeRowIndex
          ? activeTileIndex !== null
            ? Math.min(Math.max(activeTileIndex, 0), row.letters.length - 1)
            : current.length < row.letters.length
              ? current.length
              : null
          : null;
      const rowHintRevealTileIndex =
        index === activeRowIndex ? hintRevealTileIndex : null;
      const tiles = row.letters.map((letter, cellIndex) => ({
        key: cellIndex,
        letter,
        status: statuses[cellIndex],
        animationOrder: index * row.letters.length + cellIndex,
        animateEntry: animateTileEntry,
        isActive: resolvedActiveTileIndex === cellIndex,
        onClick: index === activeRowIndex ? onTileSelect : undefined,
        isLoss,
        isHintReveal: rowHintRevealTileIndex === cellIndex,
        hintRevealPulse,
      }));

      return {
        key: index,
        tiles,
        isPastRow: index < guesses.length,
        isActiveRow: index === activeRowIndex,
        showNormalDictionaryBonusIndicator: Boolean(
          normalDictionaryBonusRowFlags[index],
        ),
      };
    });
  }, [
    activeRowHintStatuses,
    animateTileEntry,
    current,
    gameOver,
    guesses,
    roundConfig,
    hintRevealPulse,
    hintRevealTileIndex,
    isLoss,
    normalDictionaryBonusRowFlags,
    activeTileIndex,
    onTileSelect,
  ]);

  return {
    rows,
    isShaking,
  };
};

export default useBoardController;
