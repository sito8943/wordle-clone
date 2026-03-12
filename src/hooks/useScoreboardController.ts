import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScoreEntry } from "../api/score/types";
import { env } from "../config/env";
import { useApi } from "../providers";

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

type ViewScoreEntry = ScoreEntry & { formattedDate: string };
type ScoreboardRowEntry = ViewScoreEntry & {
  displayRank: number;
  realRank: number | null;
  isPinnedCurrentClient: boolean;
};

export default function useScoreboardController() {
  const { scoreClient, convexEnabled } = useApi();

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [source, setSource] = useState<"convex" | "local">("local");
  const [currentClientRank, setCurrentClientRank] = useState<number | null>(
    null,
  );
  const [currentClientEntry, setCurrentClientEntry] =
    useState<ScoreEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadScores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await scoreClient.listTopScores(env.scoreLimit);
      setScores(result.scores);
      setSource(result.source);
      setCurrentClientRank(result.currentClientRank);
      setCurrentClientEntry(result.currentClientEntry);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : "Failed to load scoreboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [scoreClient]);

  useEffect(() => {
    void loadScores();
  }, [loadScores]);

  const visibleScores = useMemo<ScoreboardRowEntry[]>(() => {
    const topRows: ScoreboardRowEntry[] = scores.map((score, index) => ({
      ...score,
      formattedDate: formatDate(score.createdAt),
      displayRank: index + 1,
      realRank: index + 1,
      isPinnedCurrentClient: false,
    }));

    const alreadyVisible = topRows.some((entry) => entry.isCurrentClient);
    if (
      alreadyVisible ||
      currentClientRank === null ||
      currentClientEntry === null ||
      currentClientRank <= env.scoreLimit
    ) {
      return topRows;
    }

    return [
      ...topRows,
      {
        ...currentClientEntry,
        isCurrentClient: true,
        formattedDate: formatDate(currentClientEntry.createdAt),
        displayRank: env.scoreLimit + 1,
        realRank: currentClientRank,
        isPinnedCurrentClient: true,
      },
    ];
  }, [scores, currentClientEntry, currentClientRank]);

  const currentClientOutsideTop =
    currentClientRank !== null && currentClientRank > env.scoreLimit;

  return {
    convexEnabled,
    source,
    loading,
    error,
    scores: visibleScores,
    currentClientRank,
    currentClientOutsideTop,
    refresh: loadScores,
  };
}
