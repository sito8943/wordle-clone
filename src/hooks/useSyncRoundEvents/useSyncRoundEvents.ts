import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SyncRoundEventsBody } from "@api/score";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useSyncRoundEvents = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SyncRoundEventsBody) =>
      apiManager.scores.syncRoundEvents(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useSyncRoundEvents };
