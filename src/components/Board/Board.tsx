import { useEffect, useState } from "react";
import { buildBoardRows } from "../../domain/wordle";
import { BOARD_SHAKE_DURATION_MS } from "./constants";
import { Row } from "./Row";
import type { BoardPropsType } from "./types";

export function Board({
  guesses,
  current,
  gameOver,
  animateEntry = false,
  animateTileEntry = false,
  isLoss = false,
  shakePulse = 0,
}: BoardPropsType) {
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

  const rows = buildBoardRows(guesses, current, gameOver);
  const activeRowIndex = !gameOver ? guesses.length : -1;
  const boardClassName = `space-y-1.5 sm:space-y-2 ${
    animateEntry ? "board-entry-animation" : ""
  }`;
  const boardWrapperClassName = `mx-auto w-fit ${
    isShaking ? "board-shake-pulse-animation" : ""
  }`;

  return (
    <div className={boardWrapperClassName}>
      <div role="grid" aria-label="Wordle board" className={boardClassName}>
        {rows.map((row, index) => {
          const activeTileIndex =
            index === activeRowIndex && current.length < row.letters.length
              ? current.length
              : null;

          return (
            <Row
              key={index}
              letters={row.letters}
              statuses={row.statuses}
              startTileIndex={index * row.letters.length}
              activeTileIndex={activeTileIndex}
              isPastRow={index < guesses.length}
              isActiveRow={index === activeRowIndex}
              animateTileEntry={animateTileEntry}
              isLoss={isLoss}
            />
          );
        })}
      </div>
    </div>
  );
}
