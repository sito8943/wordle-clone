import { useMemo } from "react";
import { KEYBOARD_ROWS, getKeyStatuses } from "../../domain/wordle";
import { KEY_STYLE, KEY_STYLE_ON_LOSS } from "./constants";
import type { KeyboardProps, KeyboardRowModel } from "./types";

type UseKeyboardControllerParams = Pick<KeyboardProps, "guesses" | "isLoss">;

const useKeyboardController = ({
  guesses,
  isLoss = false,
}: UseKeyboardControllerParams) => {
  const keyStatuses = useMemo(() => getKeyStatuses(guesses), [guesses]);
  const keyStyleMap = isLoss ? KEY_STYLE_ON_LOSS : KEY_STYLE;

  const rows = useMemo<KeyboardRowModel[]>(
    () =>
      KEYBOARD_ROWS.map((row) =>
        row.map((key) => ({
          key,
          status: keyStatuses[key] ?? "default",
          isWide: key === "ENTER" || key === "BACKSPACE",
          displayKey: key === "BACKSPACE" ? "⌫" : key,
          ariaLabel:
            key === "BACKSPACE"
              ? "Delete letter"
              : key === "ENTER"
                ? "Submit guess"
                : `Letter ${key}`,
        })),
      ),
    [keyStatuses],
  );

  return {
    rows,
    keyStyleMap,
  };
};

export default useKeyboardController;
