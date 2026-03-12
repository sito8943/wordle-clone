import { buildBoardRows } from "../../domain/wordle";
import { Row } from "./Row";
import type { BoardPropsType } from "./types";

export function Board({
  guesses,
  current,
  gameOver,
  animateEntry = false,
  animateTileEntry = false,
  isLoss = false,
}: BoardPropsType) {
  const rows = buildBoardRows(guesses, current, gameOver);
  const activeRowIndex = !gameOver ? guesses.length : -1;
  const boardClassName = `space-y-1.5 sm:space-y-2 m-auto ${
    animateEntry ? "board-entry-animation" : ""
  }`;

  return (
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
  );
}
