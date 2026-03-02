import { Row } from './Row';
import type { GuessResult } from '../hooks/useWordle';

interface BoardProps {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
}

export function Board({ guesses, current, gameOver }: BoardProps) {
  return (
    <div className="board">
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
