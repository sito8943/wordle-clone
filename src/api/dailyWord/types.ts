export type DailyWordResponse = {
  ok?: unknown;
  data?: {
    word?: unknown;
  };
};

export type DailyWordMeaningResponse = {
  ok?: unknown;
  data?: {
    meanings?: Array<{
      senses?: Array<{
        description?: unknown;
      }>;
    }>;
  };
};

export type DailyWordClientOptions = {
  endpoint?: string;
  storage?: Storage;
  fetchFn?: typeof fetch;
};
