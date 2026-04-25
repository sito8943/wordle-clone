import { useMemo } from "react";
import { getKeyboardRows, getKeyStatuses } from "@domain/wordle";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { i18n } from "@i18n";
import { KEY_STYLE } from "../constants";
import type { KeyboardRowModel, UseKeyboardControllerParams } from "../types";

const useKeyboardController = ({
  guesses,
  language = WORDS_DEFAULT_LANGUAGE,
}: UseKeyboardControllerParams) => {
  const keyStatuses = useMemo(() => getKeyStatuses(guesses), [guesses]);
  const keyStyleMap = KEY_STYLE;

  const rows = useMemo<KeyboardRowModel[]>(
    () =>
      getKeyboardRows(language).map((row) =>
        row.map((key) => ({
          key,
          status: keyStatuses[key] ?? "default",
          isWide: key === "ENTER" || key === "BACKSPACE",
          displayKey: key === "BACKSPACE" ? "⌫" : key,
          ariaLabel:
            key === "BACKSPACE"
              ? i18n.t("play.gameplay.keys.deleteLetter")
              : key === "ENTER"
                ? i18n.t("play.gameplay.keys.submitGuess")
                : i18n.t("play.gameplay.keys.letter", { key }),
        })),
      ),
    [keyStatuses, language],
  );

  return {
    rows,
    keyStyleMap,
  };
};

export default useKeyboardController;
