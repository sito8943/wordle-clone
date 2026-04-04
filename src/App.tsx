import { Suspense, useCallback, useEffect, useState, type JSX } from "react";
import { RouterProvider } from "react-router";
import { Button, SplashScreen } from "@components";
import { useTranslation } from "@i18n";
import routes from "./routes";

const UPDATE_CHECK_INTERVAL_MS = 60_000;

const AppUpdateBanner = (): JSX.Element | null => {
  const { t } = useTranslation();
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let mounted = true;
    let cleanupInstallingWorker: (() => void) | null = null;
    let updateIntervalId: number | null = null;

    const setReady = () => {
      if (mounted) {
        setUpdateReady(true);
      }
    };

    const watchInstallingWorker = (
      worker: ServiceWorker | null | undefined,
    ) => {
      if (!worker) {
        return;
      }

      const handleStateChange = () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setReady();
        }
      };

      worker.addEventListener("statechange", handleStateChange);
      cleanupInstallingWorker = () => {
        worker.removeEventListener("statechange", handleStateChange);
      };
    };

    const handleControllerChange = () => {
      window.location.reload();
    };

    const watchRegistration = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setReady();
      }

      const handleUpdateFound = () => {
        if (cleanupInstallingWorker) {
          cleanupInstallingWorker();
          cleanupInstallingWorker = null;
        }

        watchInstallingWorker(registration.installing);
      };

      registration.addEventListener("updatefound", handleUpdateFound);
      updateIntervalId = window.setInterval(() => {
        void registration.update();
      }, UPDATE_CHECK_INTERVAL_MS);

      return () => {
        registration.removeEventListener("updatefound", handleUpdateFound);

        if (cleanupInstallingWorker) {
          cleanupInstallingWorker();
          cleanupInstallingWorker = null;
        }

        if (updateIntervalId !== null) {
          window.clearInterval(updateIntervalId);
        }
      };
    };

    let cleanupRegistration: (() => void) | null = null;

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    void navigator.serviceWorker.getRegistration().then((registration) => {
      if (!mounted || !registration) {
        return;
      }

      cleanupRegistration = watchRegistration(registration);
    });

    return () => {
      mounted = false;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );

      if (cleanupRegistration) {
        cleanupRegistration();
      }
    };
  }, []);

  const reloadWithUpdate = useCallback(async () => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      window.location.reload();
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();

    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    window.location.reload();
  }, []);

  if (!updateReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 shadow-xl dark:border-amber-600 dark:bg-amber-950/95">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {t("app.updateAvailableMessage")}
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setUpdateReady(false)}
          >
            {t("app.updateDismissAction")}
          </Button>
          <Button color="warning" onClick={() => void reloadWithUpdate()}>
            {t("app.updateReloadAction")}
          </Button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <RouterProvider router={routes} />
      <AppUpdateBanner />
    </Suspense>
  );
}

export default App;
