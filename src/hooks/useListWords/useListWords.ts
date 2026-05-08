import { useQuery } from "@tanstack/react-query";
import type { DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseListWordsParams = {
  language: DictionaryLanguage;
  enabled?: boolean;
};

const useListWords = ({ language, enabled = true }: UseListWordsParams) => {
  const { apiManager } = useApi();

  return useQuery({
    queryKey: queryKeys.wordsByLanguage(language),
    queryFn: () => apiManager.words.list(language),
    enabled,
  });
};

export { useListWords };
export type { UseListWordsParams };
