import { useCallback, useMemo, useState } from "react";
import { ConsentContext } from "./ConsentContext";
import type { ConsentContextType, ConsentProviderProps } from "./types";
import { persistConsent, readStoredConsent } from "./utils";

/**
 * Consent for optional technologies (today: anonymous feature usage).
 * Essential storage (player, game, preferences) does not depend on it.
 */
const ConsentProvider = ({ children }: ConsentProviderProps) => {
  const [analytics, setAnalyticsState] = useState<boolean | null>(
    () => readStoredConsent()?.analytics ?? null,
  );
  const [reopened, setReopened] = useState(false);

  const setAnalytics = useCallback((allowed: boolean) => {
    persistConsent(allowed);
    setAnalyticsState(allowed);
    setReopened(false);
  }, []);

  const openNotice = useCallback(() => setReopened(true), []);

  const value = useMemo<ConsentContextType>(
    () => ({
      analytics,
      isNoticeOpen: analytics === null || reopened,
      setAnalytics,
      openNotice,
    }),
    [analytics, reopened, setAnalytics, openNotice],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
};

export { ConsentProvider };
