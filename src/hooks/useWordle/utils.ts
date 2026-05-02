import {
  WORDLE_START_ANIMATION_SESSION_KEY,
  WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY,
} from "@domain/wordle";

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

export const isEditableKeyboardTarget = (
  target: EventTarget | null,
): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
};

export const isDirectGameKeyboardKey = (key: string): boolean =>
  key === "Backspace" ||
  key === "Enter" ||
  key === "ArrowLeft" ||
  key === "ArrowRight" ||
  /^[a-zA-ZñÑ]$/.test(key);

export const hasVisibleModalDialog = (): boolean => {
  if (typeof document === "undefined") {
    return false;
  }

  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
};

export const blurRefreshButtonIfFocused = (): void => {
  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLButtonElement)) {
    return;
  }

  if (activeElement.dataset.wordleRefresh !== "true") {
    return;
  }

  activeElement.blur();
};

export const getPresentHintLetter = (
  answer: string,
  currentIndex: number,
  currentGuess: string,
): string | null => {
  if (currentIndex < 0 || currentIndex >= answer.length) {
    return null;
  }

  const currentAnswerLetter = answer[currentIndex];
  const guessedLetters = new Set(currentGuess.toUpperCase().split(""));
  const seen = new Set<string>();
  let fallback: string | null = null;

  for (const letter of answer) {
    if (letter === currentAnswerLetter || seen.has(letter)) {
      continue;
    }

    seen.add(letter);
    if (!guessedLetters.has(letter)) {
      return letter;
    }

    if (!fallback) {
      fallback = letter;
    }
  }

  return fallback;
};

export const getFirstEmptyTileIndex = (
  currentGuess: string,
  lettersPerRow: number,
): number | null => {
  for (let index = 0; index < lettersPerRow; index += 1) {
    const letter = currentGuess[index];
    if (!letter || letter.trim() === "") {
      return index;
    }
  }

  return null;
};
