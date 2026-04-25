export type FeatureFlags = {
  wordListButtonEnabled: boolean;
  wordReportButtonEnabled: boolean;
  paypalDonationButtonEnabled: boolean;
  shareButtonEnabled: boolean;
  devConsoleEnabled: boolean;
  soundEnabled: boolean;
  hintsEnabled: boolean;
  helpButtonEnabled: boolean;
  challengesEnabled: boolean;
  settingsDrawerEnabled: boolean;
  lightningModeEnabled: boolean;
  timerAutoPauseEnabled: boolean;
  difficultyEasyEnabled: boolean;
  difficultyNormalEnabled: boolean;
  difficultyHardEnabled: boolean;
  difficultyInsaneEnabled: boolean;
};

export type FeatureFlagsContextType = FeatureFlags;
