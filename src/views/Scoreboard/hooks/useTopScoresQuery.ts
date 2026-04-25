import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { env } from "@config";
import { SCOREBOARD_MODE_IDS } from "@domain/wordle";
import type { PlayerLanguage, ScoreboardModeId } from "@domain/wordle";
import { useApi } from "@providers";
import { queryKeys } from "@hooks";

const useTopScoresQuery = (
  limit = env.scoreLimit,
  language: PlayerLanguage = WORDS_DEFAULT_LANGUAGE,
  modeId: ScoreboardModeId = SCOREBOARD_MODE_IDS.CLASSIC,
) => {
  const { scoreClient } = useApi();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => queryKeys.topScoresByLimitLanguageAndMode(limit, language, modeId),
    [language, limit, modeId],
  );

  const query = useQuery({
    queryKey,
    placeholderData: () =>
      scoreClient.getCachedTopScores(limit, language, modeId),
    queryFn: () => scoreClient.listTopScores(limit, language, modeId),
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
