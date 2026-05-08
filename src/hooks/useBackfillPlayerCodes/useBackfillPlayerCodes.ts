import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useBackfillPlayerCodes = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiManager.players.backfillCodes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useBackfillPlayerCodes };
