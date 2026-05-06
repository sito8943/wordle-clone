import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./global.css";
import { i18n, initI18n } from "@i18n";
import { env } from "@config";
import App from "./App.tsx";
import { ErrorBoundary, ErrorFallback } from "@components";
import { resetBrowserStorageOnAppUpdate } from "@layouts/View/utils";
import {
  ApiProvider,
  DialogQueueProvider,
  FeatureFlagsProvider,
  PopupProvider,
  PlayerProvider,
  SoundProvider,
} from "@providers";
import {
  WORDLE_MUSIC_MAP,
  WORDLE_SOUND_EVENT_MAP,
  WORDLE_SOUND_STORAGE_KEY_PREFIX,
  WORDLE_SOUND_STORAGE_KEYS,
} from "@providers/Sound";
import { queryClient } from "./queryClient";

resetBrowserStorageOnAppUpdate(env.appVersion);

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
        fallback={() => (
          <div className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
            <ErrorFallback
              title={i18n.t("errors.appRoot.title")}
              description={i18n.t("errors.appRoot.description")}
              actionLabel={i18n.t("errors.appRoot.action")}
            />
          </div>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <SoundProvider
            featureEnabled={env.soundEnabled}
            eventMap={WORDLE_SOUND_EVENT_MAP}
            musicMap={WORDLE_MUSIC_MAP}
            storageKeyPrefix={WORDLE_SOUND_STORAGE_KEY_PREFIX}
            storageKeys={WORDLE_SOUND_STORAGE_KEYS}
          >
            <FeatureFlagsProvider>
              <ApiProvider>
                <PlayerProvider>
                  <PopupProvider>
                    <DialogQueueProvider>
                      <App />
                    </DialogQueueProvider>
                  </PopupProvider>
                </PlayerProvider>
              </ApiProvider>
            </FeatureFlagsProvider>
          </SoundProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
});
