import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdatePreferencesInput } from "@api/players";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useUpdatePreferences = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) =>
      apiManager.players.updatePreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useUpdatePreferences };
