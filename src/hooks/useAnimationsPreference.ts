import { useCallback, useEffect } from "react";
import { WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY } from "../domain/wordle";
import { useLocalStorage } from "./useLocalStorage";
import {
  WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
  WORDLE_ANIMATIONS_PREFERENCE_SYNC_EVENT,
} from "./constant";
import type { UseAnimationsPreferenceOptions } from "./types";

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

const applyAnimationsPreferenceToDocument = (
  animationsDisabled: boolean,
): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle(
    WORDLE_ANIMATIONS_DISABLED_CLASSNAME,
    animationsDisabled,
  );
};

export default function useAnimationsPreference(
  options: UseAnimationsPreferenceOptions = {},
) {
  const { applyToDocument = false } = options;
  const [storedAnimationsDisabled, setStoredAnimationsDisabled] =
    useLocalStorage<boolean>(WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY, false);

  const animationsDisabled = isBoolean(storedAnimationsDisabled)
    ? storedAnimationsDisabled
    : false;

  const setAnimationsDisabled = useCallback(
    (nextValue: boolean) => {
      setStoredAnimationsDisabled(nextValue);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent<boolean>(WORDLE_ANIMATIONS_PREFERENCE_SYNC_EVENT, {
            detail: nextValue,
          }),
        );
      }
    },
    [setStoredAnimationsDisabled],
  );

  const toggleAnimationsDisabled = useCallback(() => {
    setAnimationsDisabled(!animationsDisabled);
  }, [animationsDisabled, setAnimationsDisabled]);

  useEffect(() => {
    if (storedAnimationsDisabled === animationsDisabled) {
      return;
    }

    setAnimationsDisabled(animationsDisabled);
  }, [animationsDisabled, setAnimationsDisabled, storedAnimationsDisabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onAnimationsPreferenceSync = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;

      if (!isBoolean(customEvent.detail)) {
        return;
      }

      setStoredAnimationsDisabled(customEvent.detail);
    };

    window.addEventListener(
      WORDLE_ANIMATIONS_PREFERENCE_SYNC_EVENT,
      onAnimationsPreferenceSync,
    );

    return () => {
      window.removeEventListener(
        WORDLE_ANIMATIONS_PREFERENCE_SYNC_EVENT,
        onAnimationsPreferenceSync,
      );
    };
  }, [setStoredAnimationsDisabled]);

  useEffect(() => {
    if (!applyToDocument) {
      return;
    }

    applyAnimationsPreferenceToDocument(animationsDisabled);

    return () => {
      applyAnimationsPreferenceToDocument(false);
    };
  }, [animationsDisabled, applyToDocument]);

  return {
    animationsDisabled,
    startAnimationsEnabled: !animationsDisabled,
    setAnimationsDisabled,
    toggleAnimationsDisabled,
  };
}
