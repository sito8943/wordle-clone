import { useCallback, useEffect, useRef } from "react";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import type { KeyboardProps } from "./types";
import { useTranslation } from "@i18n";
import useKeyboardController from "./useKeyboardController";
import { DELETE_HOLD_DELAY_MS, DELETE_REPEAT_INTERVAL_MS } from "./constants";

export function Keyboard({
  guesses,
  onKey,
  language = WORDS_DEFAULT_LANGUAGE,
  animateEntry = false,
  onEntryAnimationEnd,
}: KeyboardProps) {
  const { t } = useTranslation();
  const { rows, keyStyleMap } = useKeyboardController({
    guesses,
    language,
  });
  const deleteHoldTimeoutRef = useRef<number | null>(null);
  const deleteRepeatIntervalRef = useRef<number | null>(null);
  const deleteHoldTriggeredRef = useRef(false);

  const clearDeleteRepeat = useCallback(() => {
    if (deleteHoldTimeoutRef.current !== null) {
      window.clearTimeout(deleteHoldTimeoutRef.current);
      deleteHoldTimeoutRef.current = null;
    }

    if (deleteRepeatIntervalRef.current !== null) {
      window.clearInterval(deleteRepeatIntervalRef.current);
      deleteRepeatIntervalRef.current = null;
    }
  }, []);

  const startDeleteRepeat = useCallback(() => {
    clearDeleteRepeat();
    deleteHoldTriggeredRef.current = false;
    deleteHoldTimeoutRef.current = window.setTimeout(() => {
      deleteHoldTriggeredRef.current = true;
      onKey("BACKSPACE");
      deleteRepeatIntervalRef.current = window.setInterval(() => {
        onKey("BACKSPACE");
      }, DELETE_REPEAT_INTERVAL_MS);
    }, DELETE_HOLD_DELAY_MS);
  }, [clearDeleteRepeat, onKey]);

  const stopDeleteRepeat = useCallback(() => {
    clearDeleteRepeat();
  }, [clearDeleteRepeat]);

  const handleDeleteClick = useCallback(() => {
    if (deleteHoldTriggeredRef.current) {
      deleteHoldTriggeredRef.current = false;
      return;
    }

    onKey("BACKSPACE");
  }, [onKey]);

  useEffect(() => clearDeleteRepeat, [clearDeleteRepeat]);

  return (
    <>
      <div aria-hidden="true" className="h-48 sm:h-56" />
      <div
        role="group"
        data-tour="keyboard"
        aria-label={t("play.gameplay.onScreenKeyboardAriaLabel")}
        onAnimationEnd={animateEntry ? onEntryAnimationEnd : undefined}
        className={`fixed inset-x-0 bottom-0 z-10 w-full border-t border-neutral-300 bg-neutral-100/95 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95 sm:pb-4 sm:pt-3 ${
          animateEntry ? "keyboard-entry-animation" : ""
        }`}
      >
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="mb-1.5 flex justify-center gap-1.5 last:mb-0 sm:mb-2 sm:gap-2"
          >
            {row.map(({ key, status, isWide, displayKey, ariaLabel }) => {
              const keyStyle = keyStyleMap[status];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={
                    key === "BACKSPACE" ? handleDeleteClick : () => onKey(key)
                  }
                  onPointerDown={
                    key === "BACKSPACE" ? startDeleteRepeat : undefined
                  }
                  onPointerUp={
                    key === "BACKSPACE" ? stopDeleteRepeat : undefined
                  }
                  onPointerLeave={
                    key === "BACKSPACE" ? stopDeleteRepeat : undefined
                  }
                  onPointerCancel={
                    key === "BACKSPACE" ? stopDeleteRepeat : undefined
                  }
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
