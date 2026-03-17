import { useQuery } from "@tanstack/react-query";
import { env } from "@config";
import { useApi } from "@providers";
import { queryKeys } from "./queryKeys";

const useTopScoresQuery = (limit = env.scoreLimit) => {
  const { scoreClient } = useApi();

  return useQuery({
    queryKey: queryKeys.topScoresByLimit(limit),
    queryFn: () => scoreClient.listTopScores(limit),
  });
};

export default useTopScoresQuery;
