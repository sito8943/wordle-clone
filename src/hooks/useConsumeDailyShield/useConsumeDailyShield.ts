import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConsumeDailyShieldBody } from "@api/score";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useConsumeDailyShield = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConsumeDailyShieldBody) =>
      apiManager.scores.consumeDailyShield(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useConsumeDailyShield };
