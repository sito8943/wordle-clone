import type { ReactNode } from "react";

/** The player's choice for optional, non-essential technologies. */
export type StoredConsent = {
  /** Anonymous feature usage counts (sito-feature-usage). */
  analytics: boolean;
  version: number;
  /** ISO date of the choice, kept as proof of consent. */
  decidedAt: string;
};

export type ConsentContextType = {
  /** null until the player chooses. */
  analytics: boolean | null;
  /** The notice is shown: no choice yet, or the player asked to change it. */
  isNoticeOpen: boolean;
  setAnalytics: (allowed: boolean) => void;
  /** Shows the notice again. */
  openNotice: () => void;
};

export type ConsentProviderProps = {
  children: ReactNode;
};
