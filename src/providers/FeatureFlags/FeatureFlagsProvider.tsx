import { useMemo } from "react";
import { env } from "@config";
import { FeatureFlagsContext } from "./FeatureFlagsContext";
import { resolveFeatureFlags } from "./utils";
import type { ProviderProps } from "../types";

const FeatureFlagsProvider = ({ children }: ProviderProps) => {
  const value = useMemo(
    () => resolveFeatureFlags(),
    [
      env.wordListButtonEnabled,
      env.wordReportButtonEnabled,
      env.paypalDonationButtonEnabled,
      env.shareButtonEnabled,
      env.devConsoleEnabled,
      env.hintsEnabled,
      env.helpButtonEnabled,
    ],
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export { FeatureFlagsProvider };
