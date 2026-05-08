import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ScoresRecordInput } from "@api/score";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useRecordScore = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScoresRecordInput) => apiManager.scores.record(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
    },
  });
};

export { useRecordScore };
