import { env } from "@config";
import type { FeatureFlags } from "./types";

export const resolveFeatureFlags = (): FeatureFlags => ({
  wordListButtonEnabled: env.wordListButtonEnabled,
  wordReportButtonEnabled: env.wordReportButtonEnabled,
  paypalDonationButtonEnabled: env.paypalDonationButtonEnabled,
  shareButtonEnabled: env.shareButtonEnabled,
  devConsoleEnabled: env.devConsoleEnabled,
  hintsEnabled: env.hintsEnabled,
  helpButtonEnabled: env.helpButtonEnabled,
});
