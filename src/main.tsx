import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { ErrorBoundary, ErrorFallback } from "./components";
import { ApiProvider, PlayerProvider } from "./providers/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      name="app-root"
      fallback={({ reset }) => (
        <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
          <ErrorFallback
            title="Wordle failed to load."
            description="Try again. If the issue continues, reload the page."
            actionLabel="Retry app"
            onAction={reset}
          />
        </div>
      )}
    >
      <ApiProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </ApiProvider>
    </ErrorBoundary>
  </StrictMode>,
);
