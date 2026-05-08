import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RegisterPlayerInput } from "@api/players";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useRegisterPlayer = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterPlayerInput) =>
      apiManager.players.register(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useRegisterPlayer };
