import { useQuery } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useListChallenges = ({ enabled = true } = {}) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.challengesList(),
    queryFn: () => apiManager.challenges.list(),
    enabled,
  });
};

export { useListChallenges };
