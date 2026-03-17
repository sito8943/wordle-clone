import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { NATIVE_KEYBOARD_AUTO_FOCUS_DELAY_MS } from "./constants";
import type {
  UseNativeKeyboardInputParams,
  UseNativeKeyboardInputResult,
} from "./types";
import {
  extractNativeKeyboardLetters,
  toWordleKeyFromNativeKeyboardEvent,
} from "../utils";

export const useNativeKeyboardInput = ({
  enabled,
  blocked,
  onKey,
}: UseNativeKeyboardInputParams): UseNativeKeyboardInputResult => {
  const nativeKeyboardInputRef = useRef<HTMLInputElement | null>(null);

  const focusNativeKeyboardInput = useCallback(() => {
    nativeKeyboardInputRef.current?.focus();
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
      nativeKeyboardInputRef.current?.focus();
    }, NATIVE_KEYBOARD_AUTO_FOCUS_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [blocked, enabled]);

  return {
    nativeKeyboardInputRef,
    focusNativeKeyboardInput,
    handleNativeKeyboardKeyDown,
    handleNativeKeyboardInput,
  };
};
