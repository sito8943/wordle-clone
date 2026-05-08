import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useGenerateDailyChallenge = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => apiManager.challenges.generateDaily(date),
    onSuccess: (_data, date) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.challengesToday(date),
      });
    },
  });
};

export { useGenerateDailyChallenge };
