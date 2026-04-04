import { useMemo, type JSX } from "react";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { usePlayer } from "@providers";
import { PlayViewContext } from "./PlayViewContext";
import type { PlayViewProviderProps } from "./types";
import { usePlayController } from "../hooks";

const PlayViewProvider = ({ children }: PlayViewProviderProps): JSX.Element => {
  const controller = usePlayController();
  const { player } = usePlayer();
  const { wordListButtonEnabled, devConsoleEnabled } = useFeatureFlags();

  const animateTileEntry =
    controller.startAnimationsEnabled && controller.startAnimationSeed > 0;
  const wordListEnabled =
    wordListButtonEnabled && controller.wordListEnabledForDifficulty;
  const preferNativeKeyboard = player.keyboardPreference === "native";

  const value = useMemo(
    () => ({
      controller,
      player,
      wordListButtonEnabled: wordListEnabled,
      developerConsoleEnabled: devConsoleEnabled,
      preferNativeKeyboard,
      animateTileEntry,
    }),
    [
      animateTileEntry,
      controller,
      devConsoleEnabled,
      player,
      preferNativeKeyboard,
      wordListEnabled,
    ],
  );

  return (
    <PlayViewContext.Provider value={value}>
      {children}
    </PlayViewContext.Provider>
  );
};

export { PlayViewProvider };
