import {
  KEYBOARD_ROWS,
  getKeyStatuses,
  type GuessResult,
} from "../domain/wordle";
import type { TileStatus } from "../utils/checker";

const KEY_STYLE: Record<TileStatus | "default", string> = {
  correct: "border-black bg-black text-white hover:bg-neutral-800",
  present: "border-yellow-600 bg-yellow-500 text-black hover:bg-yellow-400",
  absent: "border-neutral-500 bg-neutral-500 text-white hover:bg-neutral-600",
  default:
    "border-neutral-300 bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
};

interface KeyboardProps {
  guesses: GuessResult[];
  onKey: (key: string) => void;
}

export function Keyboard({ guesses, onKey }: KeyboardProps) {
  const keyStatuses = getKeyStatuses(guesses);

  return (
    <div
      role="group"
      aria-label="On-screen keyboard"
      className="w-full pb-2 sm:pb-4"
    >
      {KEYBOARD_ROWS.map((row, ri) => (
        <div
          key={ri}
          className="mb-1.5 flex justify-center gap-1.5 last:mb-0 sm:mb-2 sm:gap-2"
        >
          {row.map((key) => {
            const status = keyStatuses[key];
            const keyStyle = status ? KEY_STYLE[status] : KEY_STYLE.default;
            const isWide = key === "ENTER" || key === "BACKSPACE";
            const displayKey = key === "BACKSPACE" ? "⌫" : key;
            const ariaLabel =
              key === "BACKSPACE"
                ? "Delete letter"
                : key === "ENTER"
                  ? "Submit guess"
                  : `Letter ${key}`;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onKey(key)}
                aria-label={ariaLabel}
                className={`flex h-11 w-9 items-center justify-center rounded-lg border text-xs font-bold tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:translate-y-px sm:h-12 sm:w-10 sm:text-sm ${isWide ? "w-14 text-[0.65rem] sm:w-16 sm:text-xs" : ""} ${keyStyle}`}
              >
                {displayKey}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
