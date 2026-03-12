import type { TileStatus } from "../../utils/types";

export const KEY_STYLE: Record<TileStatus | "default", string> = {
  correct: "border-black bg-black text-white hover:bg-neutral-800",
  present: "border-yellow-600 bg-yellow-500 text-black hover:bg-yellow-400",
  absent: "border-neutral-500 bg-neutral-500 text-white hover:bg-neutral-600",
  default:
    "border-neutral-300 bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
};
