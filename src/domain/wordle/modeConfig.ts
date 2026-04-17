import { CLASSIC_ROUND_CONFIG, resolveBoardRoundConfig } from "./roundConfig";
import type { BoardRoundConfig, WordleModeId } from "./types";

export const WORDLE_MODE_IDS = {
  CLASSIC: "classic",
  LIGHTNING: "lightning",
  ZEN: "zen",
  DAILY: "daily",
} as const;

const ROUND_CONFIG_BY_MODE: Record<WordleModeId, Partial<BoardRoundConfig>> = {
  classic: CLASSIC_ROUND_CONFIG,
  lightning: CLASSIC_ROUND_CONFIG,
  zen: CLASSIC_ROUND_CONFIG,
  daily: CLASSIC_ROUND_CONFIG,
};

const isWordleModeId = (value: unknown): value is WordleModeId =>
  value === WORDLE_MODE_IDS.CLASSIC ||
  value === WORDLE_MODE_IDS.LIGHTNING ||
  value === WORDLE_MODE_IDS.ZEN ||
  value === WORDLE_MODE_IDS.DAILY;

export const resolveWordleModeId = (value?: string | null): WordleModeId =>
  isWordleModeId(value) ? value : WORDLE_MODE_IDS.CLASSIC;

export const resolveRoundConfigForMode = (
  modeId: WordleModeId,
  roundConfig?: Partial<BoardRoundConfig>,
): BoardRoundConfig =>
  resolveBoardRoundConfig({
    ...ROUND_CONFIG_BY_MODE[modeId],
    ...roundConfig,
  });
