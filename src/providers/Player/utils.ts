import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
} from "@domain/wordle";
import { DEFAULT_PLAYER } from "./constants";

export const normalizePlayerName = (value: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return DEFAULT_PLAYER.name;
  }

  return normalized.slice(0, 30);
};

const normalizePlayerCode = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
};

const normalizeScoreCounter = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value * 10) / 10);
};

const normalizeStreakCounter = (value: unknown): number => {
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

const isPlayerKeyboardPreference = (
  value: unknown,
): value is PlayerKeyboardPreference =>
  value === "onscreen" || value === "native";

const normalizePlayerKeyboardPreference = (
  value: unknown,
): PlayerKeyboardPreference => {
  if (!isPlayerKeyboardPreference(value)) {
    return DEFAULT_PLAYER.keyboardPreference;
  }

  return value;
};

const resolveDevicePlayerLanguage = (): PlayerLanguage => {
  if (typeof navigator === "undefined") {
    return DEFAULT_PLAYER.language;
  }

  const navigatorLanguages = Array.isArray(navigator.languages)
    ? navigator.languages
    : [];
  const candidates = [navigator.language, ...navigatorLanguages];
  const preferredLanguage = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  if (!preferredLanguage) {
    return DEFAULT_PLAYER.language;
  }

  return preferredLanguage.trim().toLowerCase().startsWith("es")
    ? "es"
    : DEFAULT_PLAYER.language;
};

const normalizePlayerLanguage = (value: unknown): PlayerLanguage => {
  if (value === "en" || value === "es") {
    return value;
  }

  return resolveDevicePlayerLanguage();
};

const normalizeShowEndOfGameDialogs = (value: unknown): boolean => {
  if (typeof value !== "boolean") {
    return DEFAULT_PLAYER.showEndOfGameDialogs;
  }

  return value;
};

export const normalizePlayer = (value: Partial<Player> | null): Player => {
  if (!value) {
    return {
      ...DEFAULT_PLAYER,
      language: resolveDevicePlayerLanguage(),
    };
  }

  return {
    name:
      typeof value.name === "string"
        ? normalizePlayerName(value.name)
        : DEFAULT_PLAYER.name,
    code: normalizePlayerCode(value.code),
    score: normalizeScoreCounter(value.score),
    streak: normalizeStreakCounter(value.streak),
    language: normalizePlayerLanguage(value.language),
    difficulty: normalizePlayerDifficulty(value.difficulty),
    keyboardPreference: normalizePlayerKeyboardPreference(
      value.keyboardPreference,
    ),
    showEndOfGameDialogs: normalizeShowEndOfGameDialogs(
      value.showEndOfGameDialogs,
    ),
  };
};

export const resolveInitialPlayer = (): Player => ({
  ...DEFAULT_PLAYER,
  language: resolveDevicePlayerLanguage(),
});

export const arePlayersEqual = (
  left: Partial<Player> | null,
  right: Partial<Player> | null,
): boolean => {
  const normalizedLeft = normalizePlayer(left);
  const normalizedRight = normalizePlayer(right);

  return (
    normalizedLeft.name === normalizedRight.name &&
    normalizedLeft.code === normalizedRight.code &&
    normalizedLeft.score === normalizedRight.score &&
    normalizedLeft.streak === normalizedRight.streak &&
    normalizedLeft.language === normalizedRight.language &&
    normalizedLeft.difficulty === normalizedRight.difficulty &&
    normalizedLeft.keyboardPreference === normalizedRight.keyboardPreference &&
    normalizedLeft.showEndOfGameDialogs === normalizedRight.showEndOfGameDialogs
  );
};

export const isStoredPlayerNormalized = (
  value: Partial<Player> | null,
): boolean => {
  const normalized = normalizePlayer(value);

  return (
    value?.name === normalized.name &&
    value?.code === normalized.code &&
    value?.score === normalized.score &&
    value?.streak === normalized.streak &&
    value?.language === normalized.language &&
    value?.difficulty === normalized.difficulty &&
    value?.keyboardPreference === normalized.keyboardPreference &&
    value?.showEndOfGameDialogs === normalized.showEndOfGameDialogs
  );
};
