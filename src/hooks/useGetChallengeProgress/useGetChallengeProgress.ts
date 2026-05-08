import { useQuery } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseGetChallengeProgressParams = {
  date: string;
  enabled?: boolean;
};

const useGetChallengeProgress = ({
  date,
  enabled = true,
}: UseGetChallengeProgressParams) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.challengesProgress(date),
    queryFn: () => apiManager.challenges.getProgress(date),
    enabled: enabled && date.length > 0,
  });
};

export { useGetChallengeProgress };
export type { UseGetChallengeProgressParams };
