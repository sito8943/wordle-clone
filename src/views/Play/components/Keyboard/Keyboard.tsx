import { useCallback, useEffect, useRef } from "react";
import type { KeyboardProps } from "./types";
import { useTranslation } from "@i18n";
import useKeyboardController from "./useKeyboardController";
import { DELETE_HOLD_DELAY_MS, DELETE_REPEAT_INTERVAL_MS } from "./constants";

export function Keyboard({
  guesses,
  onKey,
  language = "en",
  animateEntry = false,
  onEntryAnimationEnd,
  isLoss = false,
}: KeyboardProps) {
  const { t } = useTranslation();
  const { rows, keyStyleMap } = useKeyboardController({
    guesses,
    isLoss,
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
      <div aria-hidden="true" className="h-48 sm:hidden" />
      <div
        role="group"
        aria-label={t("play.gameplay.onScreenKeyboardAriaLabel")}
        onAnimationEnd={animateEntry ? onEntryAnimationEnd : undefined}
        className={`w-full pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:pt-0 sm:pb-4 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-10 max-sm:bg-neutral-100/95 max-sm:backdrop-blur-sm dark:max-sm:bg-neutral-900/95 ${
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
