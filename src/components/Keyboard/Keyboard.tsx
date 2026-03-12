import { KEYBOARD_ROWS, getKeyStatuses } from "../../domain/wordle";
import { KEY_STYLE, KEY_STYLE_ON_LOSS } from "./constant";
import type { KeyboardProps } from "./types";

export function Keyboard({
  guesses,
  onKey,
  animateEntry = false,
  onEntryAnimationEnd,
  isLoss = false,
}: KeyboardProps) {
  const keyStatuses = getKeyStatuses(guesses);
  const keyStyleMap = isLoss ? KEY_STYLE_ON_LOSS : KEY_STYLE;

  return (
    <>
      <div aria-hidden="true" className="h-48 sm:hidden" />
      <div
        role="group"
        aria-label="On-screen keyboard"
        onAnimationEnd={animateEntry ? onEntryAnimationEnd : undefined}
        className={`w-full pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:pt-0 sm:pb-4 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-10 max-sm:bg-neutral-100/95 max-sm:backdrop-blur-sm dark:max-sm:bg-neutral-900/95 ${
          animateEntry ? "keyboard-entry-animation" : ""
        }`}
      >
        {KEYBOARD_ROWS.map((row, ri) => (
          <div
            key={ri}
            className="mb-1.5 flex justify-center gap-1.5 last:mb-0 sm:mb-2 sm:gap-2"
          >
            {row.map((key) => {
              const status = keyStatuses[key];
              const keyStyle = status
                ? keyStyleMap[status]
                : keyStyleMap.default;
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
                  className={`flex h-11 w-9 items-center justify-center rounded-lg border text-xs font-bold tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:scale-[0.97] dark:focus-visible:ring-neutral-200 dark:focus-visible:ring-offset-neutral-900 sm:h-12 sm:w-10 sm:text-sm ${isWide ? "w-14 text-[0.65rem] sm:w-16 sm:text-xs" : ""} ${keyStyle}`}
                >
                  {displayKey}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
