import type { PlayerDifficulty } from "@domain/wordle";
import {
  EASY_MODE_HINT_LIMIT,
  HARD_MODE_HINT_LIMIT,
  HINT_USAGE_STORAGE_KEY,
  NORMAL_MODE_HINT_LIMIT,
} from "./constants";
import type { HintUsageSnapshot } from "./types";
import type { HintTileStatus } from "@hooks/useWordle/types";

export const getHintsLimitByDifficulty = (
  difficulty: PlayerDifficulty,
): number => {
  if (difficulty === "easy") {
    return EASY_MODE_HINT_LIMIT;
  }

  if (difficulty === "hard") {
    return HARD_MODE_HINT_LIMIT;
  }

  if (difficulty === "insane") {
    return HARD_MODE_HINT_LIMIT;
  }

  return NORMAL_MODE_HINT_LIMIT;
};

export const getHintStatusByDifficulty = (
  difficulty: PlayerDifficulty,
): HintTileStatus | null => {
  if (difficulty === "easy") {
    return "correct";
  }

  if (difficulty === "normal") {
    return "present";
  }

  return null;
};

const normalizeHintsUsed = (hintsUsed: number): number => {
  if (!Number.isFinite(hintsUsed) || hintsUsed < 0) {
    return 0;
  }
  return Math.floor(hintsUsed);
};

const isHintUsageSnapshot = (value: unknown): value is HintUsageSnapshot => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as Partial<HintUsageSnapshot>;

  return (
    typeof maybe.answer === "string" && typeof maybe.hintsUsed === "number"
  );
};

export const getHintsUsedForAnswer = (answer: string): number => {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const raw = localStorage.getItem(HINT_USAGE_STORAGE_KEY);
    if (!raw) {
      return 0;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isHintUsageSnapshot(parsed)) {
      return 0;
    }
    if (parsed.answer !== answer) {
      return 0;
    }

    return normalizeHintsUsed(parsed.hintsUsed);
  } catch {
    return 0;
  }
};

export const setHintUsageSnapshot = (snapshot: HintUsageSnapshot): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      HINT_USAGE_STORAGE_KEY,
      JSON.stringify({
        ...snapshot,
        hintsUsed: normalizeHintsUsed(snapshot.hintsUsed),
      }),
    );
  } catch {
    // Ignore storage write errors.
  }
};

export const clearHintUsageSnapshot = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(HINT_USAGE_STORAGE_KEY);
  } catch {
    // Ignore storage remove errors.
  }
};
