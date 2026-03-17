import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WORDS_DEFAULT_LANGUAGE, type DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "./queryKeys";

const useDictionaryQuery = (
  language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  initialWords: string[] = [],
) => {
  const { wordDictionaryClient } = useApi();
  const queryClient = useQueryClient();

  useQuery({
    queryKey: queryKeys.dictionaryChecksumByLanguage(language),
    queryFn: async () => {
      const remote = await wordDictionaryClient.fetchRemoteChecksum(language);
      if (!remote) return null;

      const stored = wordDictionaryClient.getStoredChecksum(language);
      if (stored !== remote.checksum) {
        wordDictionaryClient.clearCache(language);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dictionaryByLanguage(language),
        });
      }

      return remote;
    },
  });

  return useQuery({
    queryKey: queryKeys.dictionaryByLanguage(language),
    queryFn: () => wordDictionaryClient.loadWords(language),
    initialData: initialWords.length > 0 ? initialWords : undefined,
  });
};

export default useDictionaryQuery;
