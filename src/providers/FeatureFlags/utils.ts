import { env } from "@config";
import type { FeatureFlags } from "./types";

const isDevelopmentMode = (mode: string): boolean =>
  mode === "development" || mode === "develpment";

export const resolveFeatureFlags = (): FeatureFlags => ({
  wordListButtonEnabled: env.wordListButtonEnabled,
  wordReportButtonEnabled: env.wordReportButtonEnabled,
  paypalDonationButtonEnabled: env.paypalDonationButtonEnabled,
  shareButtonEnabled: env.shareButtonEnabled,
  devConsoleEnabled: env.devConsoleEnabled && isDevelopmentMode(env.mode),
  soundEnabled: env.soundEnabled,
  masterAndMusicChannelsEnabled: env.masterAndMusicChannelsEnabled,
  hintsEnabled: env.hintsEnabled,
  helpButtonEnabled: env.helpButtonEnabled,
  challengesEnabled: env.challengesEnabled,
  settingsDrawerEnabled: env.settingsDrawerEnabled,
  lightningModeEnabled: env.lightningModeEnabled,
  lightningStartCueAndAutoTimerEnabled:
    env.lightningStartCueAndAutoTimerEnabled,
  timerAutoPauseEnabled: env.timerAutoPauseEnabled,
  difficultyEasyEnabled: env.difficultyEasyEnabled,
  difficultyNormalEnabled: env.difficultyNormalEnabled,
  difficultyHardEnabled: env.difficultyHardEnabled,
  difficultyInsaneEnabled: env.difficultyInsaneEnabled,
});
