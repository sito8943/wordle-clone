import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useRefreshWordsChecksum = () => {
  const { apiManager } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: DictionaryLanguage) =>
      apiManager.words.refreshChecksum(language),
    onSuccess: (_data, language) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wordsChecksumByLanguage(language),
      });
    },
  });
};

export { useRefreshWordsChecksum };
