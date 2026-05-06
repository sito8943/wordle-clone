import { ROUTES } from "@config/routes";
import { WORDLE_MODE_IDS, type WordleModeId } from "@domain/wordle";

export const TOP_TEN_LIMIT = 10;
export const NAVBAR_TOP_TEN_LIMIT = 10;
export const TOGGLE_INTERVAL_MS = 5000;

export const HELP_MODE_BY_PATHNAME: Record<string, WordleModeId> = {
  [ROUTES.CLASSIC]: WORDLE_MODE_IDS.CLASSIC,
  [ROUTES.LIGHTING]: WORDLE_MODE_IDS.LIGHTNING,
  [ROUTES.ZEN]: WORDLE_MODE_IDS.ZEN,
  [ROUTES.DAILY]: WORDLE_MODE_IDS.DAILY,
};
