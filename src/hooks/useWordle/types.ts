import type { DictionaryLanguage } from "@api/words";
import type { BoardRoundConfig } from "@domain/wordle";

export type UseWordleOptions = {
  allowUnknownWords?: boolean;
  language?: DictionaryLanguage;
  manualTileSelection?: boolean;
  roundConfig?: Partial<BoardRoundConfig>;
};

export type HintTileStatus = "correct" | "present";
