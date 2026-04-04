import { useMemo } from "react";
import { FeatureFlagsContext } from "./FeatureFlagsContext";
import { resolveFeatureFlags } from "./utils";
import type { ProviderProps } from "../types";

const FeatureFlagsProvider = ({ children }: ProviderProps) => {
  const value = useMemo(() => resolveFeatureFlags(), []);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export { FeatureFlagsProvider };
