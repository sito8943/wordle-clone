import {
  WORDLE_START_ANIMATION_SESSION_KEY,
  WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY,
} from "../../domain/wordle";

export const hasSeenStartAnimationInSession = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  return sessionStorage.getItem(WORDLE_START_ANIMATION_SESSION_KEY) === "seen";
};

export const markStartAnimationAsSeen = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WORDLE_START_ANIMATION_SESSION_KEY, "seen");
};

export const shouldAnimateOnFirstSessionView = (
  animationsDisabled: boolean,
  hasRestoredBoard: boolean,
): boolean => {
  if (
    animationsDisabled ||
    hasRestoredBoard ||
    hasSeenStartAnimationInSession()
  ) {
    return false;
  }

  markStartAnimationAsSeen();
  return true;
};

export const hasSeenKeyboardAnimationInSession = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    sessionStorage.getItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY) ===
    "seen"
  );
};

export const markKeyboardAnimationAsSeen = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY, "seen");
};

export const shouldAnimateKeyboardEntryOnSession = (
  animationsDisabled: boolean,
): boolean => {
  if (animationsDisabled || hasSeenKeyboardAnimationInSession()) {
    return false;
  }

  markKeyboardAnimationAsSeen();
  return true;
};
