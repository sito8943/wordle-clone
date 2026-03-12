import { buildBoardRows } from "../../domain/wordle";
import { Row } from "./Row";
import type { BoardPropsType } from "./types";

export function Board({ guesses, current, gameOver }: BoardPropsType) {
  const rows = buildBoardRows(guesses, current, gameOver);

  return (
    <div
      role="grid"
      aria-label="Wordle board"
      className="space-y-1.5 sm:space-y-2"
    >
      {rows.map((row, index) => (
        <Row key={index} letters={row.letters} statuses={row.statuses} />
      ))}
    </div>
  );
}
