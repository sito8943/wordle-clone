import type { TileStatus } from '../utils/checker';
import type { GuessResult } from '../hooks/useWordle';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const STATUS_PRIORITY: TileStatus[] = ['correct', 'present', 'absent'];

const KEY_BG: Record<TileStatus | 'default', string> = {
  correct: '#538d4e',
  present: '#b59f3b',
  absent: '#3a3a3c',
  default: '#818384',
};

function getKeyStatuses(guesses: GuessResult[]): Record<string, TileStatus> {
  const result: Record<string, TileStatus> = {};
  for (const { word, statuses } of guesses) {
    word.split('').forEach((letter, i) => {
      const prev = result[letter];
      const next = statuses[i];
      if (!prev || STATUS_PRIORITY.indexOf(next) < STATUS_PRIORITY.indexOf(prev)) {
        result[letter] = next;
      }
    });
  }
  return result;
}

interface KeyboardProps {
  guesses: GuessResult[];
  onKey: (key: string) => void;
}

export function Keyboard({ guesses, onKey }: KeyboardProps) {
  const keyStatuses = getKeyStatuses(guesses);

  return (
    <div className="keyboard">
      {ROWS.map((row, ri) => (
        <div key={ri} className="keyboard-row">
          {row.map((key) => {
            const status = keyStatuses[key];
            const bg = status ? KEY_BG[status] : KEY_BG.default;
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={`keyboard-key${isWide ? ' keyboard-key--wide' : ''}`}
                style={{
                  backgroundColor: bg,
                }}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
