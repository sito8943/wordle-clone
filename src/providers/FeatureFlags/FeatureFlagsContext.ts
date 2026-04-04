import { createContext } from "react";
import type { FeatureFlagsContextType } from "./types";

export const FeatureFlagsContext = createContext<
  FeatureFlagsContextType | undefined
>(undefined);
