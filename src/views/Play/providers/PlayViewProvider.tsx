import { useMemo, type JSX } from "react";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { usePlayer } from "@providers";
import { useChallenges } from "@hooks/useChallenges";
import { PlayViewContext } from "./PlayViewContext";
import type { PlayViewProviderProps } from "./types";
import { usePlayController } from "../hooks";

const PlayViewProvider = ({
  children,
  modeId,
}: PlayViewProviderProps): JSX.Element => {
  const controller = usePlayController({ modeId });
  const { player } = usePlayer();
  const { wordListButtonEnabled, devConsoleEnabled, challengesEnabled } =
    useFeatureFlags();

  const challenges = useChallenges(challengesEnabled);

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
      challengesEnabled,
      preferNativeKeyboard,
      animateTileEntry,
      challenges,
    }),
    [
      animateTileEntry,
      controller,
      challenges,
      challengesEnabled,
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
