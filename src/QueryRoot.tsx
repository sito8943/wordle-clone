import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";
import { env } from "@config";
import { queryClient, queryPersister, TWENTY_FOUR_HOURS } from "./queryClient";

const QueryRoot = ({ children }: { children: ReactNode }) =>
  queryPersister ? (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: TWENTY_FOUR_HOURS,
        buster: env.appVersion,
      }}
    >
      {children}
    </PersistQueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

export { QueryRoot };
