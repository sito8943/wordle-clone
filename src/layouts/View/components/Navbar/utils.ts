import { env } from "@config";
import {
  readDailyModeOutcomeForDate,
  resolvePlayableWordleModeId,
  WORDLE_MODE_IDS,
  type WordleModeId,
} from "@domain/wordle";
import { TOP_TEN_LIMIT } from "./constants";

export const getScoreboardToneClassName = (rank: number | null): string => {
  if (rank === 1) {
    return "border border-red-300 bg-red-100/80 text-red-700 hover:bg-red-200/90";
  }

  if (rank !== null && rank <= TOP_TEN_LIMIT) {
    return "border border-emerald-300 bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/90";
  }

  return "border border-neutral-300 bg-neutral-200/80 text-neutral-600 hover:bg-neutral-300/90";
};

export const normalizePathname = (pathname: string): string => {
  if (pathname.length <= 1) {
    return pathname;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

export const resolveNavbarPlayableModeId = (
  modeId: WordleModeId,
): WordleModeId => {
  if (modeId === WORDLE_MODE_IDS.LIGHTNING && !env.lightningModeEnabled) {
    return WORDLE_MODE_IDS.CLASSIC;
  }

  return resolvePlayableWordleModeId(modeId);
};

export const hasResolvedDailyOutcomeForToday = (
  playerCode?: string | null,
): boolean =>
  readDailyModeOutcomeForDate(playerCode) !== null ||
  readDailyModeOutcomeForDate() !== null;
