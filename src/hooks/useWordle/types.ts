import type { DictionaryLanguage } from "@api/words";

export type UseWordleOptions = {
  allowUnknownWords?: boolean;
  language?: DictionaryLanguage;
};

export type HintTileStatus = "correct" | "present";
