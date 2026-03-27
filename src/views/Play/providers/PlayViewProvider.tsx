import { useMemo, type JSX } from "react";
import { env } from "@config";
import { usePlayer } from "@providers";
import { PlayViewContext } from "./PlayViewContext";
import type { PlayViewProviderProps } from "./types";
import { usePlayController } from "../hooks";

const PlayViewProvider = ({ children }: PlayViewProviderProps): JSX.Element => {
  const controller = usePlayController();
  const { player } = usePlayer();

  const animateTileEntry =
    controller.startAnimationsEnabled && controller.startAnimationSeed > 0;
  const wordListButtonEnabled =
    env.wordListButtonEnabled && controller.wordListEnabledForDifficulty;
  const developerConsoleEnabled =
    env.mode === "development" || env.mode === "develpment";
  const preferNativeKeyboard = player.keyboardPreference === "native";

  const value = useMemo(
    () => ({
      controller,
      player,
      wordListButtonEnabled,
      developerConsoleEnabled,
      preferNativeKeyboard,
      animateTileEntry,
    }),
    [
      animateTileEntry,
      controller,
      developerConsoleEnabled,
      player,
      preferNativeKeyboard,
      wordListButtonEnabled,
    ],
  );

  return (
    <PlayViewContext.Provider value={value}>
      {children}
    </PlayViewContext.Provider>
  );
};

export { PlayViewProvider };
