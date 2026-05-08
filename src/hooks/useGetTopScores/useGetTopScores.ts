import { useQuery } from "@tanstack/react-query";
import type { GetTopScoresParams } from "@api/score";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useGetTopScores = (params: GetTopScoresParams = {}) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.topScoresV2(params),
    queryFn: () => apiManager.scores.getTop(params),
  });
};

export { useGetTopScores };
