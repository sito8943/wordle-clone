import { CLASSIC_ROUND_CONFIG, resolveBoardRoundConfig } from "./roundConfig";
import type { BoardRoundConfig, ScoreboardModeId, WordleModeId } from "./types";

export const WORDLE_MODE_IDS = {
  CLASSIC: "classic",
  LIGHTNING: "lightning",
  ZEN: "zen",
  DAILY: "daily",
} as const;

export const SCOREBOARD_MODE_IDS = {
  CLASSIC: WORDLE_MODE_IDS.CLASSIC,
  LIGHTNING: WORDLE_MODE_IDS.LIGHTNING,
  DAILY: WORDLE_MODE_IDS.DAILY,
} as const;

const ROUND_CONFIG_BY_MODE: Record<WordleModeId, Partial<BoardRoundConfig>> = {
  classic: CLASSIC_ROUND_CONFIG,
  lightning: CLASSIC_ROUND_CONFIG,
  zen: CLASSIC_ROUND_CONFIG,
  daily: CLASSIC_ROUND_CONFIG,
};

const MODE_RULES_ENABLED_BY_ID: Record<WordleModeId, boolean> = {
  classic: true,
  lightning: true,
  zen: false,
  daily: true,
};

const isWordleModeId = (value: unknown): value is WordleModeId =>
  value === WORDLE_MODE_IDS.CLASSIC ||
  value === WORDLE_MODE_IDS.LIGHTNING ||
  value === WORDLE_MODE_IDS.ZEN ||
  value === WORDLE_MODE_IDS.DAILY;

const isScoreboardModeId = (value: unknown): value is ScoreboardModeId =>
  value === SCOREBOARD_MODE_IDS.CLASSIC ||
  value === SCOREBOARD_MODE_IDS.LIGHTNING ||
  value === SCOREBOARD_MODE_IDS.DAILY;

export const resolveWordleModeId = (value?: string | null): WordleModeId =>
  isWordleModeId(value) ? value : WORDLE_MODE_IDS.CLASSIC;

export const resolveScoreboardModeId = (
  value?: string | null,
): ScoreboardModeId =>
  isScoreboardModeId(value) ? value : SCOREBOARD_MODE_IDS.CLASSIC;

export const isWordleModeEnabled = (modeId: WordleModeId): boolean =>
  MODE_RULES_ENABLED_BY_ID[modeId];

export const resolvePlayableWordleModeId = (
  modeId: WordleModeId,
): WordleModeId =>
  isWordleModeEnabled(modeId) ? modeId : WORDLE_MODE_IDS.CLASSIC;

export const resolveRoundConfigForMode = (
  modeId: WordleModeId,
  roundConfig?: Partial<BoardRoundConfig>,
): BoardRoundConfig =>
  resolveBoardRoundConfig({
    ...ROUND_CONFIG_BY_MODE[modeId],
    ...roundConfig,
  });
