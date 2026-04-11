import { DAILY_CHALLENGES_PROGRESS_UPDATED_EVENT } from "./constants";

const isBrowser = (): boolean => typeof window !== "undefined";

export const notifyDailyChallengesProgressUpdated = (): void => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(DAILY_CHALLENGES_PROGRESS_UPDATED_EVENT));
};

export const subscribeToDailyChallengesProgressUpdated = (
  listener: () => void,
): (() => void) => {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(DAILY_CHALLENGES_PROGRESS_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(
      DAILY_CHALLENGES_PROGRESS_UPDATED_EVENT,
      listener,
    );
  };
};
