import type { TileStatus } from '../utils/checker';

type Status = TileStatus | 'empty' | 'tbd';

const BG: Record<Status, string> = {
  empty: 'transparent',
  tbd: 'transparent',
  correct: '#538d4e',
  present: '#b59f3b',
  absent: '#3a3a3c',
};

const BORDER: Record<Status, string> = {
  empty: '#3a3a3c',
  tbd: '#565758',
  correct: 'transparent',
  present: 'transparent',
  absent: 'transparent',
};

interface TileProps {
  letter?: string;
  status: Status;
}

export function Tile({ letter, status }: TileProps) {
  return (
    <div
      className="tile"
      style={{
        borderColor: BORDER[status],
        backgroundColor: BG[status],
      }}
    >
      {letter}
    </div>
  );
}
