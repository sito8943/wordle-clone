import {
  faBolt,
  faCalendarDay,
  faPeace,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@config/routes";
import { MAX_GUESSES, WORD_LENGTH } from "@domain/wordle";
import { NORMAL_MODE_HINT_LIMIT } from "@views/Play/hooks/useHintController/constants";
import { HARD_MODE_TOTAL_SECONDS } from "@views/Play/hooks/usePlayController/constants";
import type {
  GameModeCard,
  GameModeDetailKeyMap,
  GameModeTranslationValues,
} from "./types";

export const GAME_MODES_ENTRY_ANIMATION_SESSION_KEY =
  "wordle:game-modes-entry-animation-seen";
export const GAME_MODES_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS = 100;
export const GAME_MODES_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS = 90;

export const GAME_MODE_CARDS: GameModeCard[] = [
  {
    id: "zen",
    to: ROUTES.ZEN,
    icon: faPeace,
    iconClassName: "text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "classic",
    to: ROUTES.CLASSIC,
    icon: faPlay,
    iconClassName: "text-blue-600 dark:text-blue-300",
  },
  {
    id: "lightning",
    to: ROUTES.LIGHTING,
    icon: faBolt,
    iconClassName: "text-amber-600 dark:text-amber-300",
  },
  {
    id: "daily",
    to: ROUTES.DAILY,
    icon: faCalendarDay,
    iconClassName: "text-violet-600 dark:text-violet-300",
  },
];

export const GAME_MODE_DETAIL_KEYS: GameModeDetailKeyMap = {
  zen: [
    "gameModes.modes.zen.details.neverLose",
    "gameModes.modes.zen.details.infiniteRows",
    "gameModes.modes.zen.details.noScoreImpact",
    "gameModes.modes.zen.details.infiniteGreenHints",
    "gameModes.modes.zen.details.anyCombination",
  ],
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
  daily: ["gameModes.modes.daily.details.baseRules"],
};

export const GAME_MODE_TRANSLATION_VALUES: GameModeTranslationValues = {
  rows: MAX_GUESSES,
  letters: WORD_LENGTH,
  seconds: HARD_MODE_TOTAL_SECONDS,
  hintCount: NORMAL_MODE_HINT_LIMIT,
  extraPoints: 1,
  extraRows: 2,
};
