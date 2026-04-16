import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary, ErrorFallback } from "@components";
import { useTranslation } from "@i18n";
import { Navbar, Footer } from "./components";
import { useAnimationsPreference, useThemePreference } from "@hooks";
import {
  DIALOG_QUEUE_PRIORITIES,
  useApi,
  useDialogQueueItem,
  usePlayer,
} from "@providers";
import { normalizePlayerName } from "@providers/Player/utils";
import { env } from "@config/env";
import { ROUTES } from "@config/routes";
import { VIEW_DIALOG_IDS, VIEW_VERSION_HISTORY } from "./constants";
import {
  getStoredAppVersion,
  getVersionHistoryEntriesForUpdate,
  isVersionNewer,
  shouldAskForInitialPlayerName,
  storeAppVersion,
} from "./utils";
import VersionUpdateDialog from "./components/VersionUpdateDialog/VersionUpdateDialog";

const InitialPlayerDialog = lazy(
  () =>
    import("@layouts/View/components/InitialPlayerDialog/InitialPlayerDialog"),
);

const View = () => {
  const { t } = useTranslation();
  const { scoreClient } = useApi();
  const { player, recoverPlayer, updatePlayer } = usePlayer();
  const { pathname, hash } = useLocation();
  const isHomeRoute = pathname === ROUTES.HOME;
  useThemePreference({ applyToDocument: true });
  useAnimationsPreference({ applyToDocument: true });
  const [showInitialPlayerDialog, setShowInitialPlayerDialog] = useState(
    shouldAskForInitialPlayerName,
  );
  const [versionDialogVisible, setVersionDialogVisible] = useState(false);
  const [previousAppVersion, setPreviousAppVersion] = useState<string | null>(
    null,
  );
  const queuedInitialPlayerDialogVisible = useDialogQueueItem(
    VIEW_DIALOG_IDS.INITIAL_PLAYER,
    showInitialPlayerDialog,
    DIALOG_QUEUE_PRIORITIES.VIEW,
  );
  const queuedVersionDialogVisible = useDialogQueueItem(
    VIEW_DIALOG_IDS.VERSION_UPDATE,
    versionDialogVisible,
    DIALOG_QUEUE_PRIORITIES.VIEW,
  );

  const closeVersionDialog = useCallback(() => {
    setVersionDialogVisible(false);
    storeAppVersion(env.appVersion);
  }, []);

  const confirmInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        await updatePlayer(name);
        setShowInitialPlayerDialog(false);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : t("layout.initialPlayer.nameValidationError");
      }
    },
    [t, updatePlayer],
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
          : t("layout.initialPlayer.nameValidationError");
      }
    },
    [recoverPlayer, t],
  );

  const validateInitialPlayerName = useCallback(
    async (name: string): Promise<string | null> => {
      const normalizedName = normalizePlayerName(name);

      try {
        const isAvailable = await scoreClient.isNickAvailable(normalizedName);
        if (!isAvailable) {
          return t("layout.initialPlayer.nameNotAvailable");
        }

        return null;
      } catch {
        return t("layout.initialPlayer.nameValidationError");
      }
    },
    [scoreClient, t],
  );

  useEffect(() => {
    const currentVersion = env.appVersion;
    const storedVersion = getStoredAppVersion();

    if (!storedVersion) {
      setPreviousAppVersion(null);
      setVersionDialogVisible(true);
      storeAppVersion(currentVersion);
      return;
    }

    if (storedVersion === currentVersion) {
      return;
    }

    if (isVersionNewer(currentVersion, storedVersion)) {
      setPreviousAppVersion(storedVersion);
      setVersionDialogVisible(true);
      return;
    }
  }, []);

  const changelogEntries = useMemo(() => {
    if (!previousAppVersion) {
      const currentVersionEntry = VIEW_VERSION_HISTORY.find(
        (entry) => entry.version === env.appVersion,
      );

      if (currentVersionEntry) {
        return [currentVersionEntry];
      }

      return VIEW_VERSION_HISTORY.slice(0, 1);
    }

    return getVersionHistoryEntriesForUpdate(
      VIEW_VERSION_HISTORY,
      previousAppVersion,
      env.appVersion,
    );
  }, [previousAppVersion]);

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
                title={t("errors.routeOutlet.title")}
                description={t("errors.routeOutlet.description")}
                actionLabel={t("errors.routeOutlet.action")}
              />
            </main>
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer alwaysVisible={isHomeRoute} />
      <Suspense fallback={null}>
        {queuedVersionDialogVisible ? (
          <VersionUpdateDialog
            visible={queuedVersionDialogVisible}
            onClose={closeVersionDialog}
            currentVersion={env.appVersion}
            previousVersion={previousAppVersion}
            changelogEntries={changelogEntries}
            versionHistory={VIEW_VERSION_HISTORY}
          />
        ) : null}
      </Suspense>
      <Suspense fallback={null}>
        {queuedInitialPlayerDialogVisible ? (
          <InitialPlayerDialog
            visible={queuedInitialPlayerDialogVisible}
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
