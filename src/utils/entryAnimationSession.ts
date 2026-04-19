const ENTRY_ANIMATION_SEEN_VALUE = "seen";

export const hasSeenEntryAnimationInSession = (storageKey: string): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return sessionStorage.getItem(storageKey) === ENTRY_ANIMATION_SEEN_VALUE;
  } catch {
    return false;
  }
};

export const markEntryAnimationAsSeenInSession = (storageKey: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(storageKey, ENTRY_ANIMATION_SEEN_VALUE);
  } catch {
    // Ignore sessionStorage errors.
  }
};
