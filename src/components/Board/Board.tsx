import { buildBoardRows } from "../../domain/wordle";
import { Row } from "./Row";
import type { BoardPropsType } from "./types";

export function Board({
  guesses,
  current,
  gameOver,
  animateEntry = false,
}: BoardPropsType) {
  const rows = buildBoardRows(guesses, current, gameOver);
  const boardClassName = `space-y-1.5 sm:space-y-2 m-auto ${
    animateEntry ? "board-entry-animation" : ""
  }`;

  return (
    <div role="grid" aria-label="Wordle board" className={boardClassName}>
      {rows.map((row, index) => (
        <Row key={index} letters={row.letters} statuses={row.statuses} />
      ))}
    </div>
  );
}
