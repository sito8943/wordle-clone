import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useSeedChallenges = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiManager.challenges.seed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges });
    },
  });
};

export { useSeedChallenges };
