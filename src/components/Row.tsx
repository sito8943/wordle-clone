import { Tile } from './Tile';
import type { TileStatus } from '../utils/checker';

interface RowProps {
  word?: string;
  statuses?: TileStatus[];
  current?: string;
}

export function Row({ word, statuses, current }: RowProps) {
  return (
    <div className="board-row">
      {Array.from({ length: 5 }, (_, i) => {
        if (word && statuses) {
          return <Tile key={i} letter={word[i]} status={statuses[i]} />;
        }
        if (current !== undefined) {
          return (
            <Tile
              key={i}
              letter={current[i]}
              status={current[i] ? 'tbd' : 'empty'}
            />
          );
        }
        return <Tile key={i} status="empty" />;
      })}
    </div>
  );
}
