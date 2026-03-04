import { Row } from "./Row";
import type { BoardPropsType } from "./types";

export function Board({ guesses, current, gameOver }: BoardPropsType) {
  return (
    <div
      role="grid"
      aria-label="Wordle board"
      className="space-y-1.5 sm:space-y-2"
    >
      {Array.from({ length: 6 }, (_, i) => {
        if (i < guesses.length) {
          return (
            <Row
              key={i}
              word={guesses[i].word}
              statuses={guesses[i].statuses}
            />
          );
        }
        if (i === guesses.length && !gameOver) {
          return <Row key={i} current={current} />;
        }
        return <Row key={i} />;
      })}
    </div>
  );
}
