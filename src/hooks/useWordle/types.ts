import type { DictionaryLanguage } from "@api/words";
import type { BoardRoundConfig, WordleModeId } from "@domain/wordle";

export type UseWordleOptions = {
  allowUnknownWords?: boolean;
  allowSubmitWhenModalOpen?: boolean;
  language?: DictionaryLanguage;
  manualTileSelection?: boolean;
  roundConfig?: Partial<BoardRoundConfig>;
  modeId?: WordleModeId;
};

export type HintTileStatus = "correct" | "present";
