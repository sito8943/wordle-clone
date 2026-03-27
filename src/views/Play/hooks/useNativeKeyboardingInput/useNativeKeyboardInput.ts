import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import {
  NATIVE_KEYBOARD_AUTO_FOCUS_DELAY_MS,
  NATIVE_KEYBOARD_SCROLL_RESTORE_FRAMES,
} from "./constants";
import type {
  UseNativeKeyboardInputParams,
  UseNativeKeyboardInputResult,
} from "./types";
import {
  extractNativeKeyboardLetters,
  toWordleKeyFromNativeKeyboardEvent,
} from "@views/Play/utils";

export const useNativeKeyboardInput = ({
  enabled,
  blocked,
  onKey,
}: UseNativeKeyboardInputParams): UseNativeKeyboardInputResult => {
  const nativeKeyboardInputRef = useRef<HTMLInputElement | null>(null);

  const focusNativeKeyboardInput = useCallback(() => {
    const input = nativeKeyboardInputRef.current;
    if (!input) {
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    input.focus({ preventScroll: true });

    let frameCount = 0;
    const restoreScrollPosition = () => {
      window.scrollTo(scrollX, scrollY);
      frameCount += 1;

      if (frameCount < NATIVE_KEYBOARD_SCROLL_RESTORE_FRAMES) {
        window.requestAnimationFrame(restoreScrollPosition);
      }
    };

    window.requestAnimationFrame(restoreScrollPosition);
  }, []);

  const handleNativeKeyboardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (blocked) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = toWordleKeyFromNativeKeyboardEvent(event.key);
      if (!key) {
        return;
      }

      event.preventDefault();
      onKey(key);
    },
    [blocked, onKey],
  );

  const handleNativeKeyboardInput = useCallback(() => {
    const input = nativeKeyboardInputRef.current;
    if (!input || blocked) {
      return;
    }

    const letters = extractNativeKeyboardLetters(input.value);
    input.value = "";

    for (const letter of letters) {
      onKey(letter);
    }
  }, [blocked, onKey]);

  useEffect(() => {
    if (!enabled || blocked) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      focusNativeKeyboardInput();
    }, NATIVE_KEYBOARD_AUTO_FOCUS_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [blocked, enabled, focusNativeKeyboardInput]);

  return {
    nativeKeyboardInputRef,
    focusNativeKeyboardInput,
    handleNativeKeyboardKeyDown,
    handleNativeKeyboardInput,
  };
};
