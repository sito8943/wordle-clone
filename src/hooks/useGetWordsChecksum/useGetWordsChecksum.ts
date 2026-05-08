import { useQuery } from "@tanstack/react-query";
import type { DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

type UseGetWordsChecksumParams = {
  language: DictionaryLanguage;
  enabled?: boolean;
};

const useGetWordsChecksum = ({
  language,
  enabled = true,
}: UseGetWordsChecksumParams) => {
  const { apiManager } = useApi();

  return useQuery({
    queryKey: queryKeys.wordsChecksumByLanguage(language),
    queryFn: () => apiManager.words.getChecksum(language),
    enabled,
  });
};

export { useGetWordsChecksum };
export type { UseGetWordsChecksumParams };
