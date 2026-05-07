import { useEffect, useMemo, useState } from "react";
import { buildBoardRows } from "@domain/wordle";
import { BOARD_SHAKE_DURATION_MS } from "../constants";
import type {
  BoardRowViewModel,
  UseBoardControllerParams,
  UseBoardControllerResult,
} from "../types";

const useBoardController = ({
  guesses,
  current,
  gameOver,
  roundConfig,
  animateTileEntry = false,
  shakePulse = 0,
  hintRevealPulse = 0,
  activeRowHintStatuses = {},
  hintRevealTileIndex = null,
  normalDictionaryBonusRowFlags = [],
  activeTileIndex = null,
  onTileSelect,
  overflowBufferRows,
  overflowTriggerRemainingRows,
  maxVisibleRows,
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

  const { rows, rowOffset, isRowWindowed } = useMemo<{
    rows: BoardRowViewModel[];
    rowOffset: number;
    isRowWindowed: boolean;
  }>(() => {
    const allBoardRows = buildBoardRows(
      guesses,
      current,
      gameOver,
      roundConfig,
      {
        overflowBufferRows,
        overflowTriggerRemainingRows,
      },
    );
    const safeMaxVisibleRows =
      typeof maxVisibleRows === "number" &&
      Number.isFinite(maxVisibleRows) &&
      maxVisibleRows > 0
        ? Math.floor(maxVisibleRows)
        : null;
    const rowOffset =
      safeMaxVisibleRows !== null && allBoardRows.length > safeMaxVisibleRows
        ? allBoardRows.length - safeMaxVisibleRows
        : 0;
    const isRowWindowed = safeMaxVisibleRows !== null;
    const boardRows =
      rowOffset > 0 ? allBoardRows.slice(rowOffset) : allBoardRows;
    const activeRowGlobalIndex = !gameOver ? guesses.length : -1;
    const activeRowIndex =
      activeRowGlobalIndex >= rowOffset
        ? activeRowGlobalIndex - rowOffset
        : -1;

    const rows = boardRows.map((row, index) => {
      const globalRowIndex = rowOffset + index;
      const statuses =
        globalRowIndex === activeRowGlobalIndex
          ? row.statuses.map(
              (status, cellIndex) => activeRowHintStatuses[cellIndex] ?? status,
            )
          : row.statuses;
      const resolvedActiveTileIndex =
        globalRowIndex === activeRowGlobalIndex
          ? activeTileIndex !== null
            ? Math.min(Math.max(activeTileIndex, 0), row.letters.length - 1)
            : current.length < row.letters.length
              ? current.length
              : null
          : null;
      const rowHintRevealTileIndex =
        globalRowIndex === activeRowGlobalIndex ? hintRevealTileIndex : null;
      const tiles = row.letters.map((letter, cellIndex) => ({
        key: cellIndex,
        letter,
        status: statuses[cellIndex],
        animationOrder: globalRowIndex * row.letters.length + cellIndex,
        animateEntry: animateTileEntry,
        isActive: resolvedActiveTileIndex === cellIndex,
        onClick:
          globalRowIndex === activeRowGlobalIndex ? onTileSelect : undefined,
        isHintReveal: rowHintRevealTileIndex === cellIndex,
        hintRevealPulse,
      }));

      return {
        key: globalRowIndex,
        tiles,
        isPastRow: globalRowIndex < guesses.length,
        isActiveRow: index === activeRowIndex,
        showNormalDictionaryBonusIndicator: Boolean(
          normalDictionaryBonusRowFlags[globalRowIndex],
        ),
      };
    });

    return {
      rows,
      rowOffset,
      isRowWindowed,
    };
  }, [
    activeRowHintStatuses,
    animateTileEntry,
    current,
    gameOver,
    guesses,
    roundConfig,
    overflowBufferRows,
    overflowTriggerRemainingRows,
    maxVisibleRows,
    hintRevealPulse,
    hintRevealTileIndex,
    normalDictionaryBonusRowFlags,
    activeTileIndex,
    onTileSelect,
  ]);

  const result: UseBoardControllerResult = {
    rows,
    isShaking,
    rowOffset,
    isRowWindowed,
  };

  return result;
};

export default useBoardController;
