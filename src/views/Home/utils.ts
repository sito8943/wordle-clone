import { HOME_ENTRY_ANIMATION_SESSION_KEY } from "./constants";

export const hasSeenEntryAnimationInSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return sessionStorage.getItem(HOME_ENTRY_ANIMATION_SESSION_KEY) === "seen";
  } catch {
    return false;
  }
};

export const markEntryAnimationAsSeenInSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(HOME_ENTRY_ANIMATION_SESSION_KEY, "seen");
  } catch {
    // Ignore sessionStorage errors.
  }
};
