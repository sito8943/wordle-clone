import { useMemo, type JSX } from "react";
import { env } from "../../../config";
import { useHomeController } from "../../../hooks";
import { usePlayer } from "../../../providers";
import { HomeViewContext } from "./HomeViewContext";
import type { HomeViewProviderProps } from "./types";

const HomeViewProvider = ({ children }: HomeViewProviderProps): JSX.Element => {
  const controller = useHomeController();
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
    <HomeViewContext.Provider value={value}>
      {children}
    </HomeViewContext.Provider>
  );
};

export { HomeViewProvider };
