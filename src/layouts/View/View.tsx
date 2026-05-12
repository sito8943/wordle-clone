import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
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
import {
  ROUTES,
  ROUTE_SEARCH_PARAMS,
  ROUTE_SEARCH_PARAM_VALUES,
  getChangelogRoute,
} from "@config/routes";
import { VIEW_DIALOG_IDS } from "./constants";
import { getResolvedVersionChangelog } from "./changelog";
import {
  clearPendingPreviousAppVersion,
  getPendingPreviousAppVersion,
  getStoredAppVersion,
  isVersionNewer,
  shouldAskForInitialPlayerName,
  storeAppVersion,
} from "./utils";
import VersionUpdateDialog from "./components/VersionUpdateDialog/VersionUpdateDialog";
import { VERSION_UPDATE_DIALOG_FEATURE_IMAGE_SRC } from "./components/VersionUpdateDialog/constants";

const InitialPlayerDialog = lazy(
  () =>
    import("@layouts/View/components/InitialPlayerDialog/InitialPlayerDialog"),
);

const View = () => {
  const { t, i18n } = useTranslation();
  const { apiManager } = useApi();
  const { player, recoverPlayer, updatePlayer } = usePlayer();
  const { pathname, hash, search } = useLocation();
  const navigate = useNavigate();
  const appVersion = env.appVersion;
  const isHomeRoute = pathname === ROUTES.HOME;
  const isZenRoute = pathname === ROUTES.ZEN;
  const zenFocusModeActive =
    isZenRoute &&
    new URLSearchParams(search).get(ROUTE_SEARCH_PARAMS.FOCUS) ===
      ROUTE_SEARCH_PARAM_VALUES.FOCUS_ON;
  const shouldShowFooter = !isHomeRoute && !isZenRoute;
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

  const markVersionDialogAsSeen = useCallback(() => {
    storeAppVersion(appVersion);
    clearPendingPreviousAppVersion();
  }, [appVersion]);

  const closeVersionDialog = useCallback(() => {
    setVersionDialogVisible(false);
    markVersionDialogAsSeen();
  }, [markVersionDialogAsSeen]);

  const openVersionChangelog = useCallback(
    (version: string) => {
      setVersionDialogVisible(false);
      markVersionDialogAsSeen();
      navigate(getChangelogRoute(version));
    },
    [markVersionDialogAsSeen, navigate],
  );

  const openCurrentVersionChangelog = useCallback(() => {
    openVersionChangelog(appVersion);
  }, [appVersion, openVersionChangelog]);
  const currentVersionChangelog = useMemo(
    () => getResolvedVersionChangelog(appVersion, i18n.language),
    [appVersion, i18n.language],
  );
  const featuredVersionChange = currentVersionChangelog?.changes[0] ?? null;

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
        const { available: isAvailable } =
          await apiManager.players.getNickAvailability(normalizedName);
        if (!isAvailable) {
          return t("layout.initialPlayer.nameNotAvailable");
        }

        return null;
      } catch {
        return t("layout.initialPlayer.nameValidationError");
      }
    },
    [apiManager, t],
  );

  useEffect(() => {
    const currentVersion = appVersion;
    const pendingPreviousVersion = getPendingPreviousAppVersion();

    if (pendingPreviousVersion) {
      setPreviousAppVersion(pendingPreviousVersion);
      setVersionDialogVisible(true);
      return;
    }

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
  }, [appVersion]);

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
        {!isHomeRoute ? (
          <div
            data-testid="view-navbar-shell"
            aria-hidden={zenFocusModeActive}
            className={`overflow-hidden transition-[max-height,opacity,translate,transform,margin] duration-500 ease-in-out ${
              zenFocusModeActive
                ? "-translate-y-12 opacity-0 -mt-2 pointer-events-none"
                : "translate-y-0 opacity-100 mt-0"
            }`}
          >
            <Navbar />
          </div>
        ) : null}
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
      {shouldShowFooter ? <Footer /> : null}
      <Suspense fallback={null}>
        {queuedVersionDialogVisible ? (
          <VersionUpdateDialog
            visible={queuedVersionDialogVisible}
            onClose={closeVersionDialog}
            onOpenCurrentChangelog={openCurrentVersionChangelog}
            currentVersion={appVersion}
            previousVersion={previousAppVersion}
            featuredChange={featuredVersionChange}
            featuredImageSrc={VERSION_UPDATE_DIALOG_FEATURE_IMAGE_SRC}
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
