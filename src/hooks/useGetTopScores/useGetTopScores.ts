import { useQuery } from "@tanstack/react-query";
import type { GetTopScoresParams } from "@api/score";
import { decorateTopScoresResponse } from "@api/score/utils";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const DEFAULT_LANGUAGE = "en" as const;

const useGetTopScores = (params: GetTopScoresParams = {}) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.topScoresV2(params),
    queryFn: async () => {
      const response = await apiManager.scores.getTop(params);
      return decorateTopScoresResponse(response, {
        language: params.language ?? DEFAULT_LANGUAGE,
      });
    },
  });
};

export { useGetTopScores };
