export type DailyWordMeaningEntry = {
  senses?: Array<{
    description?: unknown;
  }>;
};

export type DailyWordReference = {
  gameId: string;
  seed: number;
};

export type DailyWordResponse = {
  ok?: unknown;
  data?: {
    date?: unknown;
    word?: unknown;
    gameId?: unknown;
    seed?: unknown;
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
