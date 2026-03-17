import type { TileStatus } from "@utils/types";

export const KEY_STYLE: Record<TileStatus | "default", string> = {
  correct: "border-green-600 bg-green-700 text-white hover:bg-green-600",
  present: "border-yellow-600 bg-yellow-500 text-black hover:bg-yellow-400",
  absent: "border-neutral-500 bg-neutral-500 text-white hover:bg-neutral-600",
  default:
    "border-neutral-300 bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600",
};

const NEUTRAL_REVEALED_KEY_STYLE =
  "border-neutral-500 bg-neutral-500 text-white hover:bg-neutral-600";

export const KEY_STYLE_ON_LOSS: Record<TileStatus | "default", string> = {
  correct: NEUTRAL_REVEALED_KEY_STYLE,
  present: NEUTRAL_REVEALED_KEY_STYLE,
  absent: NEUTRAL_REVEALED_KEY_STYLE,
  default: KEY_STYLE.default,
};
