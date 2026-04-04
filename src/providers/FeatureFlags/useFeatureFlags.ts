import { useContext } from "react";
import { FeatureFlagsContext } from "./FeatureFlagsContext";
import { resolveFeatureFlags } from "./utils";

const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);

  if (context !== undefined) {
    return context;
  }

  return resolveFeatureFlags();
};

export { useFeatureFlags };
