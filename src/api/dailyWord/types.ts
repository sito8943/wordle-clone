export type DailyWordResponse = {
  ok?: unknown;
  data?: {
    word?: unknown;
  };
};

export type DailyWordClientOptions = {
  endpoint?: string;
  storage?: Storage;
  fetchFn?: typeof fetch;
};
