import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RemoteChallengeProgress,
  RemoteChallenges,
} from "@api/challenges";
import { subscribeToDailyChallengesProgressUpdated } from "@domain/challenges";
import { useApi } from "@providers/Api";
import type { UseChallengesResult } from "./types";
import {
  getMillisUntilEndOfDayUTC,
  getTodayDateUTC,
  hasSeenDialogInSession,
  markDialogSeenInSession,
} from "./utils";

const useChallenges = (enabled: boolean): UseChallengesResult => {
  const { challengeClient } = useApi();
  const [challenges, setChallenges] = useState<RemoteChallenges | null>(null);
  const [progress, setProgress] = useState<RemoteChallengeProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [millisUntilEndOfDay, setMillisUntilEndOfDay] = useState(
    getMillisUntilEndOfDayUTC,
  );
  const initializedRef = useRef(false);

  // Countdown timer — update every minute
  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      setMillisUntilEndOfDay(getMillisUntilEndOfDayUTC());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [enabled]);

  // Fetch challenges on mount
  useEffect(() => {
    if (!enabled || !challengeClient.isConfigured || initializedRef.current)
      return;
    initializedRef.current = true;

    const date = getTodayDateUTC();

    const init = async () => {
      setLoading(true);
      try {
        // Seed challenges if needed
        await challengeClient.seedChallenges();

        // Try to get today's challenges
        let todayChallenges = await challengeClient.getTodayChallenges(date);

        // Generate if they don't exist yet (first player of the day)
        if (!todayChallenges) {
          todayChallenges = await challengeClient.generateDailyChallenges(date);
        }
        setChallenges(todayChallenges);

        // Fetch player progress
        const playerProgress =
          await challengeClient.getPlayerChallengeProgress(date);
        setProgress(playerProgress);

        // Auto-show dialog if not seen in this session and at least one is incomplete
        if (!hasSeenDialogInSession() && todayChallenges) {
          const completedDailyIds = new Set(
            playerProgress.filter((p) => p.completed).map((p) => p.challengeId),
          );
          const hasIncomplete =
            !completedDailyIds.has(todayChallenges.simple.id) ||
            !completedDailyIds.has(todayChallenges.complex.id);

          if (hasIncomplete) {
            setShowDialog(true);
          }
          markDialogSeenInSession();
        }
      } catch {
        // Silently fail — challenges are non-critical
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [enabled, challengeClient]);

  const openDialog = useCallback(() => setShowDialog(true), []);
  const closeDialog = useCallback(() => setShowDialog(false), []);

  const refreshProgress = useCallback(async () => {
    if (!challengeClient.isConfigured) return;
    const date = getTodayDateUTC();
    try {
      const playerProgress =
        await challengeClient.getPlayerChallengeProgress(date);
      setProgress(playerProgress);
    } catch {
      // Silently fail
    }
  }, [challengeClient]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return subscribeToDailyChallengesProgressUpdated(() => {
      void refreshProgress();
    });
  }, [enabled, refreshProgress]);

  return {
    challenges,
    progress,
    loading,
    showDialog,
    millisUntilEndOfDay,
    openDialog,
    closeDialog,
    refreshProgress,
  };
};

export { useChallenges, getTodayDateUTC };
