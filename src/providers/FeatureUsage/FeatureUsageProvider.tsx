import { useEffect, useMemo, useRef } from "react";
import { createTracker, noopTracker } from "@sito/feature-usage";
import type { Tracker } from "@sito/feature-usage";
import { FeatureUsageProvider as BaseFeatureUsageProvider } from "@sito/feature-usage/react";
import { env } from "@config/env";
import { useConsent } from "@providers/Consent";
import routes from "../../routes";
import { FEATURE_USAGE_APP, WORDLE_FEATURES } from "./constants";
import type { FeatureUsageProviderProps, WordleFeature } from "./types";
import { trackRouterPages } from "./utils";

/**
 * Anonymous feature usage (sito-feature-usage): counts which screens are
 * used, never who uses them. Off without VITE_USAGE_URL, and until the
 * player accepts it in the privacy notice.
 */
const FeatureUsageProvider = ({ children }: FeatureUsageProviderProps) => {
  const { analytics } = useConsent();
  const allowed = analytics === true;

  const tracker = useMemo<Tracker<WordleFeature>>(
    () =>
      allowed
        ? createTracker({
            app: FEATURE_USAGE_APP,
            key: env.usageKey ?? "",
            endpoint: env.usageUrl,
            features: WORDLE_FEATURES,
          })
        : noopTracker<WordleFeature>(),
    [allowed],
  );

  // Stop the tracker it replaces; on withdrawal, also forget what it kept.
  // Not done in an effect cleanup: StrictMode's extra run would stop the
  // live tracker.
  const previous = useRef<Tracker<WordleFeature> | null>(null);
  useEffect(() => {
    const replaced = previous.current;
    previous.current = tracker;
    if (!replaced || replaced === tracker) {
      return;
    }
    replaced.stop();
    if (!allowed) {
      replaced.clear();
    }
  }, [tracker, allowed]);

  // One `page.<route>` per screen; a no-op tracker counts nothing.
  useEffect(() => trackRouterPages(routes, tracker), [tracker]);

  return (
    <BaseFeatureUsageProvider tracker={tracker}>
      {children}
    </BaseFeatureUsageProvider>
  );
};

export { FeatureUsageProvider };
