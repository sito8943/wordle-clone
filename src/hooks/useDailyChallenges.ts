import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RemoteChallengeProgress,
  RemoteDailyChallenges,
} from "@api/challenges";
import { useApi } from "@providers/Api";

const CHALLENGES_DIALOG_SEEN_KEY = "wordle:daily-challenges-dialog-seen";

const getTodayDateUTC = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const getMillisUntilEndOfDayUTC = (): number => {
  const now = new Date();
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return endOfDay.getTime() - now.getTime();
};

const hasSeenDialogInSession = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    return (
      window.sessionStorage.getItem(CHALLENGES_DIALOG_SEEN_KEY) === "seen"
    );
  } catch {
    return true;
  }
};

const markDialogSeenInSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CHALLENGES_DIALOG_SEEN_KEY, "seen");
  } catch {
    // Ignore storage write errors
  }
};

type UseDailyChallengesResult = {
  challenges: RemoteDailyChallenges | null;
  progress: RemoteChallengeProgress[];
  loading: boolean;
  showDialog: boolean;
  millisUntilEndOfDay: number;
  openDialog: () => void;
  closeDialog: () => void;
  refreshProgress: () => Promise<void>;
};

const useDailyChallenges = (enabled: boolean): UseDailyChallengesResult => {
  const { challengeClient } = useApi();
  const [challenges, setChallenges] = useState<RemoteDailyChallenges | null>(
    null,
  );
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
          todayChallenges =
            await challengeClient.generateDailyChallenges(date);
        }

        setChallenges(todayChallenges);

        // Fetch player progress
        const playerProgress =
          await challengeClient.getPlayerChallengeProgress(date);
        setProgress(playerProgress);

        // Auto-show dialog if not seen in this session and at least one is incomplete
        if (!hasSeenDialogInSession() && todayChallenges) {
          const completedIds = new Set(
            playerProgress
              .filter((p) => p.completed)
              .map((p) => p.challengeId),
          );
          const hasIncomplete =
            !completedIds.has(todayChallenges.simple.id) ||
            !completedIds.has(todayChallenges.complex.id);

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

export { useDailyChallenges, getTodayDateUTC };
