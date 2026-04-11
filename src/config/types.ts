export type RuntimeEnv = {
  appVersion: string;
  mode: string;
  baseUrl: string;
  convexUrl?: string;
  wordReportPhoneNumber?: string;
  wordListButtonEnabled: boolean;
  wordReportButtonEnabled: boolean;
  paypalDonationButtonEnabled: boolean;
  shareButtonEnabled: boolean;
  devConsoleEnabled: boolean;
  soundEnabled: boolean;
  hintsEnabled: boolean;
  helpButtonEnabled: boolean;
  dailyChallengesEnabled: boolean;
  scoreLimit: number;
  wordleGameStorageKey: string;
  paypalDonationButtonUrl?: string;
};
