import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateScoreInput } from "@api/score";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useUpdateScore = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateScoreInput) => apiManager.scores.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
    },
  });
};

export { useUpdateScore };
