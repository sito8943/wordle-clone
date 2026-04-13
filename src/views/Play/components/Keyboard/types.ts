import type { DictionaryLanguage } from "@api/words";
import type { GuessResult } from "@domain/wordle";
import type { TileStatus } from "@utils/types";

export interface KeyboardProps {
  guesses: GuessResult[];
  onKey: (key: string) => void;
  language?: DictionaryLanguage;
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

export type UseKeyboardControllerParams = Pick<
  KeyboardProps,
  "guesses" | "isLoss" | "language"
>;
