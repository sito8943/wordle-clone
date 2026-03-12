import { WORDLE_SESSION_STORAGE_KEY } from "./constants";

export const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") {
    return createSessionId();
  }

  const existing = sessionStorage.getItem(WORDLE_SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createSessionId();
  sessionStorage.setItem(WORDLE_SESSION_STORAGE_KEY, created);
  return created;
};
