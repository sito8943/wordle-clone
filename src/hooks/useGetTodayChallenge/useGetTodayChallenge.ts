import { useQuery } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseGetTodayChallengeParams = {
  date: string;
  enabled?: boolean;
};

const useGetTodayChallenge = ({
  date,
  enabled = true,
}: UseGetTodayChallengeParams) => {
  const { apiManager } = useApi();
  return useQuery({
    queryKey: queryKeys.challengesToday(date),
    queryFn: () => apiManager.challenges.getToday(date),
    enabled: enabled && date.length > 0,
  });
};

export { useGetTodayChallenge };
export type { UseGetTodayChallengeParams };
