import type { Player, PlayerDifficulty } from "./types";
import { DEFAULT_PLAYER } from "./constants";

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

const isPlayerDifficulty = (value: unknown): value is PlayerDifficulty =>
  value === "easy" ||
  value === "normal" ||
  value === "hard" ||
  value === "insane";

const normalizePlayerDifficulty = (value: unknown): PlayerDifficulty => {
  if (!isPlayerDifficulty(value)) {
    return DEFAULT_PLAYER.difficulty;
  }

  return value;
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
    difficulty: normalizePlayerDifficulty(value.difficulty),
  };
};
