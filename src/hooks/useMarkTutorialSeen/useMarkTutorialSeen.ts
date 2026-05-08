import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TutorialModeId } from "@api/players";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useMarkTutorialSeen = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modeId: TutorialModeId) =>
      apiManager.players.markTutorialSeen(modeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useMarkTutorialSeen };
