import type { TileStatus } from '../utils/checker';

type Status = TileStatus | 'empty' | 'tbd';

const STATUS_STYLE: Record<Status, string> = {
  empty: 'border-neutral-300 bg-white text-neutral-900',
  tbd: 'border-neutral-400 bg-neutral-100 text-neutral-900',
  correct: 'border-green-500 bg-green-700 text-white',
  present: 'border-yellow-500 bg-yellow-500 text-black',
  absent: 'border-neutral-700 bg-neutral-700 text-white',
};

const STATUS_LABEL: Record<Status, string> = {
  empty: 'empty',
  tbd: 'typing',
  correct: 'correct',
  present: 'present',
  absent: 'absent',
};

interface TileProps {
  letter?: string;
  status: Status;
}

export function Tile({ letter, status }: TileProps) {
  return (
    <div
      role="gridcell"
      aria-label={`${letter || 'blank'}, ${STATUS_LABEL[status]}`}
      className={`flex h-12 w-12 select-none items-center justify-center rounded-xl border-2 text-2xl font-extrabold uppercase transition-colors sm:h-14 sm:w-14 sm:text-[2rem] ${STATUS_STYLE[status]}`}
    >
      {letter}
    </div>
  );
}
