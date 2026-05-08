import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RenameNickInput } from "@api/players";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useRenameNick = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RenameNickInput) =>
      apiManager.players.renameNick(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export { useRenameNick };
