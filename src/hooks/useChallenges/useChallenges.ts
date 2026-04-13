import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RemoteChallengeProgress,
  RemoteChallenges,
} from "@api/challenges";
import {
  getWeekStartDateUTC,
  subscribeToDailyChallengesProgressUpdated,
} from "@domain/challenges";
import { useApi } from "@providers/Api";
import type { UseChallengesResult } from "./types";
import {
  getMillisUntilEndOfDayUTC,
  getMillisUntilEndOfWeekUTC,
  getTodayDateUTC,
  hasSeenDialogInSession,
  markDialogSeenInSession,
} from "./utils";

const useChallenges = (enabled: boolean): UseChallengesResult => {
  const { challengeClient } = useApi();
  const [challenges, setChallenges] = useState<RemoteChallenges | null>(null);
  const [progress, setProgress] = useState<RemoteChallengeProgress[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<
    RemoteChallengeProgress[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [millisUntilEndOfDay, setMillisUntilEndOfDay] = useState(
    getMillisUntilEndOfDayUTC,
  );
  const [millisUntilEndOfWeek, setMillisUntilEndOfWeek] = useState(
    getMillisUntilEndOfWeekUTC,
  );
  const initializedRef = useRef(false);

  // Countdown timer — update every minute
  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      setMillisUntilEndOfDay(getMillisUntilEndOfDayUTC());
      setMillisUntilEndOfWeek(getMillisUntilEndOfWeekUTC());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [enabled]);

  // Fetch challenges on mount
  useEffect(() => {
    if (!enabled || !challengeClient.isConfigured || initializedRef.current)
      return;
    initializedRef.current = true;

    const date = getTodayDateUTC();
    const weekStart = getWeekStartDateUTC(date);

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

        // Fetch challenge catalog + player progress
        const [allChallenges, playerProgress, playerWeeklyProgress] =
          await Promise.all([
            challengeClient.listAllChallenges(),
            challengeClient.getPlayerChallengeProgress(date),
            challengeClient.getPlayerChallengeProgress(weekStart),
          ]);
        setProgress(playerProgress);
        setWeeklyProgress(playerWeeklyProgress);

        // Auto-show dialog if not seen in this session and at least one is incomplete
        if (!hasSeenDialogInSession() && todayChallenges) {
          const completedDailyIds = new Set(
            playerProgress.filter((p) => p.completed).map((p) => p.challengeId),
          );
          const completedWeeklyIds = new Set(
            playerWeeklyProgress
              .filter((p) => p.completed)
              .map((p) => p.challengeId),
          );
          const hasIncompleteDaily =
            !completedDailyIds.has(todayChallenges.simple.id) ||
            !completedDailyIds.has(todayChallenges.complex.id);
          const weeklyChallengeList = allChallenges.filter(
            (challenge) => challenge.type === "weekly",
          );
          const hasIncompleteWeekly = weeklyChallengeList.some(
            (challenge) => !completedWeeklyIds.has(challenge.id),
          );
          const hasIncomplete = hasIncompleteDaily || hasIncompleteWeekly;

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
    const weekStart = getWeekStartDateUTC(date);
    try {
      const [playerProgress, playerWeeklyProgress] = await Promise.all([
        challengeClient.getPlayerChallengeProgress(date),
        challengeClient.getPlayerChallengeProgress(weekStart),
      ]);
      setProgress(playerProgress);
      setWeeklyProgress(playerWeeklyProgress);
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
    weeklyProgress,
    loading,
    showDialog,
    millisUntilEndOfDay,
    millisUntilEndOfWeek,
    openDialog,
    closeDialog,
    refreshProgress,
  };
};

export { useChallenges, getTodayDateUTC };
