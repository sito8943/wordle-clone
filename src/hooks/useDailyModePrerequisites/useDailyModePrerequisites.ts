import { useCallback, useEffect, useMemo, useState } from "react";
import { getTodayDateUTC } from "@domain/wordle";
import { useApi } from "@providers";
import type { UseDailyModePrerequisitesResult } from "./types";

const useDailyModePrerequisites = (): UseDailyModePrerequisitesResult => {
  const { dailyWordClient } = useApi();
  const dailyDate = useMemo(getTodayDateUTC, []);
  const readCachedRequirements = useCallback(() => {
    const cachedWord = dailyWordClient.getCachedWord(dailyDate);
    if (!cachedWord) {
      return null;
    }

    const cachedMeaning = dailyWordClient.getCachedMeaning(cachedWord, dailyDate);
    if (!cachedMeaning) {
      return null;
    }

    return {
      word: cachedWord,
      meaning: cachedMeaning,
    };
  }, [dailyDate, dailyWordClient]);
  const cachedRequirements = useMemo(readCachedRequirements, [
    readCachedRequirements,
  ]);
  const [reloadCount, setReloadCount] = useState(0);
  const [status, setStatus] = useState<
    UseDailyModePrerequisitesResult["status"]
  >(cachedRequirements ? "ready" : "loading");
  const [dailyWord, setDailyWord] = useState<string | null>(
    cachedRequirements?.word ?? null,
  );
  const [dailyMeaning, setDailyMeaning] = useState<string | null>(
    cachedRequirements?.meaning ?? null,
  );

  const reload = useCallback(() => {
    setReloadCount((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const currentCachedRequirements = readCachedRequirements();

    if (reloadCount === 0 && currentCachedRequirements) {
      setStatus("ready");
      setDailyWord(currentCachedRequirements.word);
      setDailyMeaning(currentCachedRequirements.meaning);
      return () => {
        cancelled = true;
      };
    }

    const loadDailyRequirements = async () => {
      setStatus("loading");
      setDailyWord(null);
      setDailyMeaning(null);

      const nextDailyWord = await dailyWordClient.getDailyWord(dailyDate);
      if (cancelled || !nextDailyWord) {
        if (!cancelled) {
          setStatus("unavailable");
        }
        return;
      }

      const nextDailyMeaning = await dailyWordClient.getDailyMeaning(
        nextDailyWord,
        dailyDate,
      );
      if (cancelled || !nextDailyMeaning) {
        if (!cancelled) {
          setDailyWord(nextDailyWord);
          setStatus("unavailable");
        }
        return;
      }

      if (cancelled) {
        return;
      }

      setDailyWord(nextDailyWord);
      setDailyMeaning(nextDailyMeaning);
      setStatus("ready");
    };

    void loadDailyRequirements();

    return () => {
      cancelled = true;
    };
  }, [dailyDate, dailyWordClient, readCachedRequirements, reloadCount]);

  return {
    status,
    isLoading: status === "loading",
    isReady: status === "ready",
    isUnavailable: status === "unavailable",
    dailyWord,
    dailyMeaning,
    reload,
  };
};

export { useDailyModePrerequisites };
