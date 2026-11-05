import type { ReactNode } from "react";
import type { FeatureOf } from "@sito/feature-usage";
import type { WORDLE_FEATURES } from "./constants";

/** The parts of the data router page tracking reads. */
export type PageRouter = {
  state: { location: { pathname: string } };
  subscribe: (
    listener: (state: { location: { pathname: string } }) => void,
  ) => () => void;
};

export type WordleFeature = FeatureOf<typeof WORDLE_FEATURES>;

export type FeatureUsageProviderProps = {
  children: ReactNode;
};
