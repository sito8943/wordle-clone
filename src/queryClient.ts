import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: TWENTY_FOUR_HOURS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const queryPersister =
  typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: "wordle:rq-cache",
      })
    : undefined;

export { queryClient, queryPersister, TWENTY_FOUR_HOURS };
