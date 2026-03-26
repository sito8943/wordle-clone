import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@config";
import type { PlayerLanguage } from "@domain/wordle";
import { useApi } from "@providers";
import { queryKeys } from "@hooks";

const useTopScoresQuery = (
  limit = env.scoreLimit,
  language: PlayerLanguage = "en",
) => {
  const { scoreClient } = useApi();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.topScoresByLimitAndLanguage(limit, language),
    [language, limit],
  );

  const query = useQuery({
    queryKey,
    placeholderData: () => scoreClient.getCachedTopScores(limit, language),
    queryFn: () => scoreClient.listTopScores(limit, language),
  });

  useEffect(() => {
    let cancelled = false;

    void scoreClient.syncPendingScores().then(({ flushed }) => {
      if (!flushed || cancelled) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey });
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient, queryKey, scoreClient]);

  return query;
};

export default useTopScoresQuery;
