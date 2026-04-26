import { useMemo, type JSX } from "react";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { usePlayer } from "@providers";
import { useChallenges } from "@hooks/useChallenges";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { PlayViewContext } from "./PlayViewContext";
import type { PlayViewProviderProps } from "./types";
import { usePlayController } from "../hooks";

const PlayViewProvider = ({
  children,
  modeId,
  allowSubmitWhenModalOpen,
}: PlayViewProviderProps): JSX.Element => {
  const controller = usePlayController({
    modeId,
    ...(allowSubmitWhenModalOpen === true
      ? { allowSubmitWhenModalOpen: true }
      : {}),
  });
  const { player } = usePlayer();
  const {
    wordListButtonEnabled,
    devConsoleEnabled,
    challengesEnabled: challengesFlagEnabled,
  } = useFeatureFlags();
  const challengesEnabled =
    challengesFlagEnabled &&
    controller.activeModeId !== WORDLE_MODE_IDS.LIGHTNING &&
    controller.activeModeId !== WORDLE_MODE_IDS.DAILY;

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
