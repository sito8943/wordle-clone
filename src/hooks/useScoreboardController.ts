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

export default function useScoreboardController() {
  const { scoreClient, convexEnabled } = useApi();

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [source, setSource] = useState<"convex" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadScores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await scoreClient.listTopScores(env.scoreLimit);
      setScores(result.scores);
      setSource(result.source);
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

  const visibleScores = useMemo<ViewScoreEntry[]>(
    () =>
      scores.map((score) => ({
        ...score,
        formattedDate: formatDate(score.createdAt),
      })),
    [scores],
  );

  return {
    convexEnabled,
    source,
    loading,
    error,
    scores: visibleScores,
    refresh: loadScores,
  };
}
