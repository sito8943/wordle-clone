import type { GuessResult } from "../../hooks";
import type { TileStatus } from "../../utils/types";

export interface KeyboardProps {
  guesses: GuessResult[];
  onKey: (key: string) => void;
  animateEntry?: boolean;
  onEntryAnimationEnd?: () => void;
  isLoss?: boolean;
}

export type KeyboardKeyModel = {
  key: string;
  displayKey: string;
  ariaLabel: string;
  isWide: boolean;
  status: TileStatus | "default";
};

export type KeyboardRowModel = KeyboardKeyModel[];
