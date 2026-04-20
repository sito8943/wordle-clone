import { CLASSIC_ROUND_CONFIG, type WordleModeId } from "@domain/wordle";
import { NORMAL_MODE_HINT_LIMIT } from "@views/Play/hooks/useHintController/constants";
import { HARD_MODE_TOTAL_SECONDS } from "@views/Play/hooks/usePlayController/constants";

export const HELP_MODE_DETAIL_KEYS: Record<WordleModeId, readonly string[]> = {
  classic: [
    "gameModes.modes.classic.details.baseRules",
    "gameModes.modes.classic.details.hintsChoice",
    "gameModes.modes.classic.details.hintsDisabledBonus",
    "gameModes.modes.classic.details.dictionaryChoice",
  ],
  lightning: [
    "gameModes.modes.lightning.details.baseRules",
    "gameModes.modes.lightning.details.timer",
    "gameModes.modes.lightning.details.hintsChoice",
    "gameModes.modes.lightning.details.hintsDisabledBonus",
    "gameModes.modes.lightning.details.dictionaryChoice",
  ],
  zen: [
    "gameModes.modes.zen.details.neverLose",
    "gameModes.modes.zen.details.infiniteRows",
    "gameModes.modes.zen.details.noScoreImpact",
    "gameModes.modes.zen.details.infiniteGreenHints",
    "gameModes.modes.zen.details.anyCombination",
  ],
  daily: ["gameModes.modes.daily.details.baseRules"],
};

export const HELP_MODE_TRANSLATION_VALUES = {
  rows: CLASSIC_ROUND_CONFIG.maxGuesses,
  letters: CLASSIC_ROUND_CONFIG.lettersPerRow,
  seconds: HARD_MODE_TOTAL_SECONDS,
  hintCount: NORMAL_MODE_HINT_LIMIT,
  extraPoints: 1,
  extraRows: 2,
} as const;
