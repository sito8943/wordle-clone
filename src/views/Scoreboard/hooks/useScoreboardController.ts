import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ScoreEntry, ScoreSource } from "@api/score";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { env } from "@config";
import { i18n } from "@i18n";
import { SCOREBOARD_MODE_IDS } from "@domain/wordle";
import type { ScoreboardModeId } from "@domain/wordle";
import { useApi } from "@providers";
import { queryKeys } from "@hooks";
import { formatDate } from "@hooks/utils";
import type { ScoreboardRowEntry } from "./types";
import useTopScoresQuery from "./useTopScoresQuery";

export default function useScoreboardController(
  modeId: ScoreboardModeId = SCOREBOARD_MODE_IDS.CLASSIC,
) {
  const { convexEnabled } = useApi();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    error: topScoresError,
    refetch,
  } = useTopScoresQuery(env.scoreLimit, WORDS_DEFAULT_LANGUAGE, modeId);
  const scores = useMemo<ScoreEntry[]>(
    () => data?.scores ?? [],
    [data?.scores],
  );
  const source: ScoreSource = data?.source ?? "local";
  const currentClientRank = data?.currentClientRank ?? null;
  const currentClientEntry = data?.currentClientEntry ?? null;
  const error =
    topScoresError instanceof Error
      ? topScoresError.message
      : topScoresError
        ? i18n.t("errors.scoreboard.description")
        : "";

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.topScores });
    await refetch();
  }, [queryClient, refetch]);

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
    loading: isLoading,
    error,
    scores: visibleScores,
    currentClientRank,
    currentClientOutsideTop,
    refresh,
  };
}
