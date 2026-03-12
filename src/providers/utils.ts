import type { Player } from "./types";
import { DEFAULT_PLAYER } from "./constant";

export const normalizePlayerName = (value: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return DEFAULT_PLAYER.name;
  }

  return normalized.slice(0, 30);
};

const normalizeCounter = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};

export const normalizePlayer = (value: Partial<Player> | null): Player => {
  if (!value) {
    return DEFAULT_PLAYER;
  }

  return {
    name:
      typeof value.name === "string"
        ? normalizePlayerName(value.name)
        : DEFAULT_PLAYER.name,
    score: normalizeCounter(value.score),
    streak: normalizeCounter(value.streak),
  };
};
