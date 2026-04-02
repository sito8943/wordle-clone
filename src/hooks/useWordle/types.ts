import type { DictionaryLanguage } from "@api/words";

export type UseWordleOptions = {
  allowUnknownWords?: boolean;
  language?: DictionaryLanguage;
  manualTileSelection?: boolean;
};

export type HintTileStatus = "correct" | "present";
