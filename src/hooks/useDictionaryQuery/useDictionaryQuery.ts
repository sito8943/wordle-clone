import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WORDS_DEFAULT_LANGUAGE, type DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "../queryKeys";

const useDictionaryQuery = (
  language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  initialWords: string[] = [],
  {
    onChecksumMismatch,
  }: {
    onChecksumMismatch?: () => void;
  } = {},
) => {
  const { wordDictionaryClient } = useApi();
  const queryClient = useQueryClient();
  const hasInitialWords = initialWords.length > 0;

  useQuery({
    queryKey: queryKeys.dictionaryChecksumByLanguage(language),
    enabled: hasInitialWords,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const remote = await wordDictionaryClient.fetchRemoteChecksum(language);
      if (!remote) return null;

      const stored = wordDictionaryClient.getStoredChecksum(language);
      if (stored !== remote.checksum) {
        if (stored !== null) {
          onChecksumMismatch?.();
        }

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
    initialData: hasInitialWords ? initialWords : undefined,
    staleTime: hasInitialWords ? Number.POSITIVE_INFINITY : undefined,
  });
};

export default useDictionaryQuery;
