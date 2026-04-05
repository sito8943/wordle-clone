import { MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS } from "./constants";

const toSafeTimestamp = (value: number): number | null => {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.floor(value);
};

export const getRoundDurationMs = (
  roundStartedAt: number,
  roundEndedAt: number,
): number | null => {
  const safeRoundStartedAt = toSafeTimestamp(roundStartedAt);
  const safeRoundEndedAt = toSafeTimestamp(roundEndedAt);

  if (safeRoundStartedAt === null || safeRoundEndedAt === null) {
    return null;
  }

  if (safeRoundEndedAt < safeRoundStartedAt) {
    return null;
  }

  return safeRoundEndedAt - safeRoundStartedAt;
};

export const isScoreCommitDurationSuspicious = (
  roundDurationMs: number,
  thresholdMs = MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS,
): boolean => {
  if (!Number.isFinite(roundDurationMs) || roundDurationMs < 0) {
    return false;
  }

  if (!Number.isFinite(thresholdMs) || thresholdMs <= 0) {
    return false;
  }

  return Math.floor(roundDurationMs) < Math.floor(thresholdMs);
};
