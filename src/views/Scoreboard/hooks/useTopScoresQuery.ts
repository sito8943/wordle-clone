import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@config";
import { useApi } from "@providers";
import { queryKeys } from "@hooks";

const useTopScoresQuery = (limit = env.scoreLimit) => {
  const { scoreClient } = useApi();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => queryKeys.topScoresByLimit(limit), [limit]);

  const query = useQuery({
    queryKey,
    placeholderData: () => scoreClient.getCachedTopScores(limit),
    queryFn: () => scoreClient.listTopScores(limit),
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
