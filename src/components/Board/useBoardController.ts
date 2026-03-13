import { useEffect, useMemo, useState } from "react";
import { buildBoardRows } from "../../domain/wordle";
import { BOARD_SHAKE_DURATION_MS } from "./constants";
import type { BoardPropsType, BoardRowViewModel } from "./types";

type UseBoardControllerParams = Pick<
  BoardPropsType,
  | "guesses"
  | "current"
  | "gameOver"
  | "shakePulse"
  | "activeRowHintStatuses"
  | "hintRevealTileIndex"
>;

const useBoardController = ({
  guesses,
  current,
  gameOver,
  shakePulse = 0,
  activeRowHintStatuses = {},
  hintRevealTileIndex = null,
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
    const boardRows = buildBoardRows(guesses, current, gameOver);
    const activeRowIndex = !gameOver ? guesses.length : -1;

    return boardRows.map((row, index) => {
      const statuses =
        index === activeRowIndex
          ? row.statuses.map(
              (status, cellIndex) => activeRowHintStatuses[cellIndex] ?? status,
            )
          : row.statuses;
      const activeTileIndex =
        index === activeRowIndex && current.length < row.letters.length
          ? current.length
          : null;

      return {
        key: index,
        letters: row.letters,
        statuses,
        startTileIndex: index * row.letters.length,
        activeTileIndex,
        isPastRow: index < guesses.length,
        isActiveRow: index === activeRowIndex,
        hintRevealTileIndex:
          index === activeRowIndex ? hintRevealTileIndex : null,
      };
    });
  }, [activeRowHintStatuses, current, gameOver, guesses, hintRevealTileIndex]);

  return {
    rows,
    isShaking,
  };
};

export default useBoardController;
