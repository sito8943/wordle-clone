import type { DictionaryLanguage } from "@api/words";

export type WordListDialogProps = {
  visible: boolean;
  language: DictionaryLanguage;
  words: string[];
  onClose: () => void;
};
