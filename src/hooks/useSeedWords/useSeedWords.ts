import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SeedWordsInput } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useSeedWords = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SeedWordsInput) => apiManager.words.seed(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.words });
    },
  });
};

export { useSeedWords };
