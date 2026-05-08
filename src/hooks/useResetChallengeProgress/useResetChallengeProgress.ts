import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useResetChallengeProgress = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => apiManager.challenges.resetProgress(date),
    onSuccess: (_data, date) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.challengesProgress(date),
      });
    },
  });
};

export { useResetChallengeProgress };
