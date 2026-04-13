import { CHALLENGES_DIALOG_SEEN_KEY } from "./constants";

export const getTodayDateUTC = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

export const getMillisUntilEndOfDayUTC = (): number => {
  const now = new Date();
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return endOfDay.getTime() - now.getTime();
};

export const hasSeenDialogInSession = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(CHALLENGES_DIALOG_SEEN_KEY) === "seen";
  } catch {
    return true;
  }
};

export const markDialogSeenInSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CHALLENGES_DIALOG_SEEN_KEY, "seen");
  } catch {
    // Ignore storage write errors
  }
};
