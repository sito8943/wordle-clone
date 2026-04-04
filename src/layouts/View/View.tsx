import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary, ErrorFallback } from "@components";
import { i18n } from "@i18n";
import { Navbar, Footer } from "./components";
import { useAnimationsPreference, useThemePreference } from "@hooks";
import { useApi, usePlayer } from "@providers";
import { normalizePlayerName } from "@providers/Player/utils";
import { shouldAskForInitialPlayerName } from "./utils";

const InitialPlayerDialog = lazy(
  () =>
    import("@layouts/View/components/InitialPlayerDialog/InitialPlayerDialog"),
);

const View = () => {
  const { scoreClient } = useApi();
  const { player, recoverPlayer, updatePlayer } = usePlayer();
  const { pathname, hash } = useLocation();
  const isHomeRoute = pathname === "/";
  useThemePreference({ applyToDocument: true });
  useAnimationsPreference({ applyToDocument: true });
  const [showInitialPlayerDialog, setShowInitialPlayerDialog] = useState(
    shouldAskForInitialPlayerName,
  );

  const confirmInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        await updatePlayer(name);
        setShowInitialPlayerDialog(false);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : i18n.t("layout.initialPlayer.nameValidationError");
      }
    },
    [updatePlayer],
  );

  const recoverInitialPlayer = useCallback(
    async (code: string): Promise<string | null> => {
      try {
        await recoverPlayer(code);
        setShowInitialPlayerDialog(false);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : i18n.t("layout.initialPlayer.nameValidationError");
      }
    },
    [recoverPlayer],
  );

  const validateInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      const normalizedName = normalizePlayerName(name);

      try {
        const isAvailable = await scoreClient.isNickAvailable(normalizedName);
        if (!isAvailable) {
          return i18n.t("layout.initialPlayer.nameNotAvailable");
        }

        return null;
      } catch {
        return i18n.t("layout.initialPlayer.nameValidationError");
      }
    },
    [scoreClient],
  );

  useEffect(() => {
    if (hash.length <= 1) {
      return;
    }

    const targetId = (() => {
      try {
        return decodeURIComponent(hash.slice(1));
      } catch {
        return hash.slice(1);
      }
    })();

    if (targetId.length === 0) {
      return;
    }

    let isDone = false;
    let observer: MutationObserver | null = null;
    let disconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let initialCheckTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scrollToTargetIfFound = (): void => {
      if (isDone) {
        return;
      }

      const element = document.getElementById(targetId);
      if (!element) {
        return;
      }

      isDone = true;
      element.scrollIntoView({ block: "start" });
      observer?.disconnect();
      if (disconnectTimeoutId !== null) {
        clearTimeout(disconnectTimeoutId);
      }
    };

    initialCheckTimeoutId = setTimeout(scrollToTargetIfFound, 0);

    if (typeof MutationObserver !== "undefined" && document.body) {
      observer = new MutationObserver(scrollToTargetIfFound);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    disconnectTimeoutId = setTimeout(() => {
      observer?.disconnect();
    }, 2000);

    return () => {
      isDone = true;
      observer?.disconnect();
      if (initialCheckTimeoutId !== null) {
        clearTimeout(initialCheckTimeoutId);
      }
      if (disconnectTimeoutId !== null) {
        clearTimeout(disconnectTimeoutId);
      }
    };
  }, [hash, pathname]);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full flex-col max-sm:p-3 p-1">
        <Navbar />
        <ErrorBoundary
          name="route-outlet"
          resetKeys={[pathname]}
          fallback={() => (
            <main className="page-centered py-10">
              <ErrorFallback
                title={i18n.t("errors.routeOutlet.title")}
                description={i18n.t("errors.routeOutlet.description")}
                actionLabel={i18n.t("errors.routeOutlet.action")}
              />
            </main>
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer alwaysVisible={isHomeRoute} />
      <Suspense fallback={null}>
        {showInitialPlayerDialog ? (
          <InitialPlayerDialog
            visible={showInitialPlayerDialog}
            onClose={() => undefined}
            initialName={player.name}
            onConfirm={confirmInitialPlayerName}
            onRecover={recoverInitialPlayer}
            onValidateName={validateInitialPlayerName}
          />
        ) : null}
      </Suspense>
    </div>
  );
};

export default View;
