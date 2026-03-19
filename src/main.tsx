import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./global.css";
import { i18n, initI18n } from "@i18n";
import App from "./App.tsx";
import { ErrorBoundary, ErrorFallback } from "@components";
import { ApiProvider, PlayerProvider } from "@providers";
import { queryClient } from "./queryClient";
import { loadFontsAsync } from "@utils/loadFontsAsync";

const root = createRoot(document.getElementById("root")!);

root.render(
  <div className="splash-screen" role="status" aria-live="polite">
    <h1 className="slab splash-word">{i18n.t("app.title")}</h1>
  </div>,
);

void initI18n().then(() => {
  root.render(
    <StrictMode>
      <ErrorBoundary
        name="app-root"
        fallback={({ reset }) => (
          <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
            <ErrorFallback
              title={i18n.t("errors.appRoot.title")}
              description={i18n.t("errors.appRoot.description")}
              actionLabel={i18n.t("errors.appRoot.action")}
              onAction={reset}
            />
          </div>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <ApiProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </ApiProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
});

void loadFontsAsync();
