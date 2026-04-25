export type DailyWordMeaningEntry = {
  senses?: Array<{
    description?: unknown;
  }>;
};

export type DailyWordResponse = {
  ok?: unknown;
  data?: {
    word?: unknown;
    meaning?: unknown;
    meanings?: DailyWordMeaningEntry[];
  };
};

export type DailyWordMeaningResponse = {
  ok?: unknown;
  data?: {
    meanings?: DailyWordMeaningEntry[];
  };
};

export type DailyWordClientOptions = {
  endpoint?: string;
  storage?: Storage;
  fetchFn?: typeof fetch;
};
