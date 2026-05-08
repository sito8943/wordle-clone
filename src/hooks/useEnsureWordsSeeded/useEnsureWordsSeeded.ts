import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useEnsureWordsSeeded = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: DictionaryLanguage) =>
      apiManager.words.ensureSeeded(language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.words });
    },
  });
};

export { useEnsureWordsSeeded };
