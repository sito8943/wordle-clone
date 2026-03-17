import { useQuery } from "@tanstack/react-query";
import { WORDS_DEFAULT_LANGUAGE, type DictionaryLanguage } from "@api/words";
import { useApi } from "@providers";
import { queryKeys } from "./queryKeys";

const useDictionaryQuery = (
  language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  initialWords: string[] = [],
) => {
  const { wordDictionaryClient } = useApi();

  return useQuery({
    queryKey: queryKeys.dictionaryByLanguage(language),
    queryFn: () => wordDictionaryClient.loadWords(language),
    initialData: initialWords.length > 0 ? initialWords : undefined,
  });
};

export default useDictionaryQuery;
